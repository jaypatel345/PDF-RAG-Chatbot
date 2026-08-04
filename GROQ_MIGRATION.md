# Groq API Migration Guide

This document outlines the changes made to migrate from OpenAI API to Groq API.

## Changes Made

### 1. Python Dependencies (`python-ai/requirements.txt`)

**Changed:**
- ❌ `langchain-openai==0.0.2`
- ✅ `langchain-groq==0.0.1`
- ✅ `sentence-transformers==2.2.2` (for free embeddings)

### 2. Environment Variables

**Changed:**
- ❌ `OPENAI_API_KEY`
- ✅ `GROQ_API_KEY`

### 3. PDF Service (`python-ai/app/services/pdf_service.py`)

**Changed:**
- ❌ `from langchain_openai import OpenAIEmbeddings`
- ✅ `from langchain_community.embeddings import HuggingFaceEmbeddings`

**Embeddings:**
- ❌ `OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))`
- ✅ `HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")`

### 4. LangGraph Workflow (`python-ai/app/graph/langgraph_workflow.py`)

**Changed:**
- ❌ `from langchain_openai import ChatOpenAI`
- ✅ `from langchain_groq import ChatGroq`

**LLM Configuration:**
- ❌ `ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7, openai_api_key=os.getenv("OPENAI_API_KEY"))`
- ✅ `ChatGroq(model="llama3-8b-8192", temperature=0.7, api_key=os.getenv("GROQ_API_KEY"))`

## Benefits of Groq API

1. **Free to Use**: Groq offers a generous free tier
2. **Faster Inference**: Groq's LPU (Language Processing Unit) provides extremely fast inference
3. **Open Source Models**: Uses Llama 3, Mixtral, and other open-source models
4. **No Rate Limits**: Much higher rate limits compared to OpenAI's free tier
5. **Compatible API**: Drop-in replacement for OpenAI API format

## Getting Groq API Key

1. Visit https://console.groq.com/
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your `.env` file:

```env
GROQ_API_KEY=gsk_your_api_key_here
```

## Model Options

Groq supports several models. The current implementation uses:
- **llama3-8b-8192** - Fast and efficient for general tasks

Other available models:
- `llama3-70b-8192` - More powerful but slower
- `mixtral-8x7b-32768` - Good for complex reasoning
- `gemma-7b-it` - Google's Gemma model

To change models, update in `python-ai/app/graph/langgraph_workflow.py`:

```python
self.llm = ChatGroq(
    model="llama3-70b-8192",  # Change this
    temperature=0.7,
    api_key=os.getenv("GROQ_API_KEY")
)
```

## Embeddings

The migration uses HuggingFace's `sentence-transformers` for embeddings:
- **Model**: `all-MiniLM-L6-v2`
- **Benefits**: Free, fast, good performance for most use cases
- **No API Key Required**: Runs locally

## Installation

After pulling the changes, reinstall Python dependencies:

```bash
cd python-ai
pip install -r requirements.txt
```

## Testing

1. Ensure your `.env` file has the correct `GROQ_API_KEY`
2. Restart the Python AI service
3. Test the chat functionality with a question
4. Verify responses are generated correctly

## Troubleshooting

### Issue: "Invalid API key" error
- Verify your Groq API key is correct
- Check that the key is set in `.env` file
- Ensure you're using the correct environment

### Issue: Slow embeddings
- First run downloads the embedding model (~500MB)
- Subsequent runs will be faster
- Consider using a smaller model if needed

### Issue: Model not found
- Verify the model name is correct
- Check Groq's documentation for available models
- Ensure you have internet connection for first-time model download

## Performance Comparison

| Metric | OpenAI GPT-3.5 | Groq Llama3-8b |
|--------|---------------|----------------|
| Cost | Paid | Free |
| Speed | ~1-2s | ~0.3-0.5s |
| Quality | Good | Good |
| Rate Limits | Low | High |

## Reverting to OpenAI (if needed)

If you need to revert to OpenAI API:

1. Update `requirements.txt`:
   - Change `langchain-groq` back to `langchain-openai`
   - Remove `sentence-transformers`

2. Update environment variable:
   - Change `GROQ_API_KEY` back to `OPENAI_API_KEY`

3. Update `pdf_service.py`:
   - Import `OpenAIEmbeddings` instead of `HuggingFaceEmbeddings`
   - Use OpenAI embeddings

4. Update `langgraph_workflow.py`:
   - Import `ChatOpenAI` instead of `ChatGroq`
   - Use OpenAI model

---

**Migration completed successfully! 🚀**
