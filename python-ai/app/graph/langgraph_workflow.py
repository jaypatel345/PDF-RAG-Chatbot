from typing import TypedDict, List, Dict, Any
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph, END
import os
from dotenv import load_dotenv
from app.services.chroma_service import ChromaService

load_dotenv()

class GraphState(TypedDict):
    question: str
    context: List[str]
    answer: str
    suggested_questions: List[str]
    source_document: str
    page_number: int

class LangGraphWorkflow:
    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.7,
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.chroma_service = ChromaService()
        self.chroma_service.initialize()
        self.graph = self._build_graph()

    def _retrieve_context(self, state: GraphState) -> GraphState:
        """Retrieve relevant context from vector database"""
        question = state["question"]
        results = self.chroma_service.search_documents(question, n_results=3)
        
        context = []
        source_document = None
        page_number = None

        if results and results.get('documents') and results['documents'][0]:
            context = results['documents'][0]
            if results.get('metadatas') and results['metadatas'][0]:
                metadata = results['metadatas'][0][0]
                source_document = metadata.get('filename', 'Unknown')
                page_number = metadata.get('page_number', 1)

        return {
            **state,
            "context": context,
            "source_document": source_document,
            "page_number": page_number
        }

    def _generate_answer(self, state: GraphState) -> GraphState:
        """Generate answer using LLM with retrieved context"""
        question = state["question"]
        context = state["context"]

        context_text = "\n\n".join(context) if context else "No relevant context found."

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful AI assistant. Answer the user's question based on the provided context from PDF documents. If the context doesn't contain the answer, say so politely."),
            ("user", "Context:\n{context}\n\nQuestion: {question}")
        ])

        chain = prompt | self.llm | StrOutputParser()
        answer = chain.invoke({
            "context": context_text,
            "question": question
        })

        return {**state, "answer": answer}

    def _generate_suggested_questions(self, state: GraphState) -> GraphState:
        """Generate suggested follow-up questions"""
        question = state["question"]
        answer = state["answer"]

        prompt = ChatPromptTemplate.from_messages([
            ("system", "Generate 3-5 relevant follow-up questions based on the conversation. Return only the questions, one per line."),
            ("user", "Original Question: {question}\n\nAnswer: {answer}")
        ])

        chain = prompt | self.llm | StrOutputParser()
        response = chain.invoke({
            "question": question,
            "answer": answer
        })

        suggested_questions = [
            q.strip() for q in response.split('\n') 
            if q.strip() and not q.strip().startswith('-')
        ][:5]

        return {**state, "suggested_questions": suggested_questions}

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(GraphState)

        workflow.add_node("retrieve_context", self._retrieve_context)
        workflow.add_node("generate_answer", self._generate_answer)
        workflow.add_node("generate_suggested_questions", self._generate_suggested_questions)

        workflow.set_entry_point("retrieve_context")
        workflow.add_edge("retrieve_context", "generate_answer")
        workflow.add_edge("generate_answer", "generate_suggested_questions")
        workflow.add_edge("generate_suggested_questions", END)

        return workflow.compile()

    def run(self, question: str) -> Dict[str, Any]:
        """Run the workflow and return the result"""
        initial_state: GraphState = {
            "question": question,
            "context": [],
            "answer": "",
            "suggested_questions": [],
            "source_document": None,
            "page_number": None
        }

        result = self.graph.invoke(initial_state)
        
        return {
            "answer": result["answer"],
            "source_document": result["source_document"],
            "page_number": result["page_number"],
            "suggested_questions": result["suggested_questions"]
        }

langgraph_workflow = LangGraphWorkflow()
