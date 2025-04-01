import json
import os
import time
from typing import List, Dict, Any
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

# Load environment variables
OPENAI_API_KEY = "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"
PINECONE_API_KEY = "pcsk_56JdY2_GHvUGeDrVdvR3TCDKDrNCPSCW4onfQg2J7zaZw8Lsny41skMmgRdgipZdoPEyER"
PINECONE_ENVIRONMENT = os.environ.get("PINECONE_ENVIRONMENT", "gcp-starter")
INDEX_NAME = "project-finder-index"
EMBEDDING_MODEL = "text-embedding-ada-002"
EMBEDDING_DIMENSION = 1536
BATCH_SIZE = 50

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def load_projects(filepath: str) -> List[Dict[str, Any]]:
    """Load project data from JSON file"""
    with open(filepath, 'r') as f:
        return json.load(f)

def prepare_text(project: Dict[str, Any]) -> str:
    """Prepare text for embedding by concatenating relevant fields"""
    title = project.get('title', '')
    summary = project.get('summary', '')
    keywords = ' '.join(project.get('keywords', []))
    
    # Concatenate fields with spaces
    text = f"{title} {summary} {keywords}"
    
    # Basic normalization
    text = text.lower().strip()
    
    return text

def create_embeddings(projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate embeddings for all projects"""
    embeddings = []
    batch = []
    texts = []
    
    print(f"Creating embeddings for {len(projects)} projects...")
    
    for i, project in enumerate(projects):
        project_id = project.get('projectNo')
        if not project_id:
            print(f"Warning: Project at index {i} has no projectNo, skipping")
            continue
            
        text = prepare_text(project)
        batch.append(project)
        texts.append(text)
        
        # Process in batches to minimize API calls
        if len(batch) >= BATCH_SIZE or i == len(projects) - 1:
            try:
                response = client.embeddings.create(
                    input=texts,
                    model=EMBEDDING_MODEL
                )
                
                # Match embeddings with projects
                for j, embedding_data in enumerate(response.data):
                    project_data = batch[j]
                    
                    # Create record for Pinecone
                    embeddings.append({
                        "id": project_data["projectNo"],
                        "values": embedding_data.embedding,
                        "metadata": {
                            "title": project_data.get("title", ""),
                            "supervisor": project_data.get("supervisor", ""),
                            "category": project_data.get("category", ""),
                            "type": project_data.get("type", ""),
                            "keywords": project_data.get("keywords", []),
                            "isJointOrURECA": project_data.get("isJointOrURECA", "No")
                        }
                    })
                
                print(f"Processed {i+1}/{len(projects)} projects")
                
                # Clear batch for next iteration
                batch = []
                texts = []
                
                # Sleep to avoid hitting rate limits
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Error creating embeddings: {e}")
                # Don't clear batch so we can retry
                time.sleep(5)
                
    return embeddings

def initialize_pinecone():
    """Initialize Pinecone and create index if it doesn't exist"""
    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY not found in environment variables")
        
    # Initialize Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Check if index exists, create if it doesn't
    if INDEX_NAME not in [idx['name'] for idx in pc.list_indexes()]:
        print(f"Creating new Pinecone index: {INDEX_NAME}")
        pc.create_index(
            name=INDEX_NAME,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="gcp",
                region="us-central1"
            )
        )
        # Wait for index to initialize
        time.sleep(1)
    
    # Get index
    return pc.Index(INDEX_NAME)

def store_embeddings(index, embeddings: List[Dict[str, Any]]):
    """Store embeddings in Pinecone index"""
    print(f"Storing {len(embeddings)} embeddings in Pinecone...")
    
    # Upsert in batches
    batch_size = 100  # Pinecone recommends 100 vectors per upsert
    for i in range(0, len(embeddings), batch_size):
        batch = embeddings[i:i+batch_size]
        try:
            index.upsert(vectors=batch)
            print(f"Upserted batch {i//batch_size + 1}/{(len(embeddings)-1)//batch_size + 1}")
        except Exception as e:
            print(f"Error upserting batch to Pinecone: {e}")
            time.sleep(5)
            # Retry with smaller batch if possible
            if len(batch) > 10:
                print("Retrying with smaller batch...")
                for j in range(0, len(batch), 10):
                    small_batch = batch[j:j+10]
                    try:
                        index.upsert(vectors=small_batch)
                    except Exception as e2:
                        print(f"Error upserting small batch: {e2}")

def query_example(index, query_text: str, top_k: int = 5):
    """Example function to query the index"""
    if not OPENAI_API_KEY:
        print("OPENAI_API_KEY not found in environment variables")
        return
        
    # Generate query embedding
    response = client.embeddings.create(
        input=query_text,
        model=EMBEDDING_MODEL
    )
    query_embedding = response.data[0].embedding
    
    # Query Pinecone
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    
    # Print results
    print(f"\nTop {top_k} results for query: '{query_text}'")
    for i, match in enumerate(results.matches):
        print(f"{i+1}. {match.metadata['title']} (Score: {match.score:.4f})")
        print(f"   Supervisor: {match.metadata['supervisor']}")
        print(f"   Keywords: {', '.join(match.metadata['keywords'])}")
        print()

def main():
    """Main function to orchestrate the embedding and storage process"""
    # Check for OpenAI API key
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    # Load project data
    projects = load_projects("./data/projects.json")
    print(f"Loaded {len(projects)} projects from JSON")
    
    # Create embeddings
    embeddings = create_embeddings(projects)
    
    # Initialize Pinecone and get index
    index = initialize_pinecone()
    
    # Store embeddings in Pinecone
    store_embeddings(index, embeddings)
    
    # Run an example query
    print("\nRunning example queries:")
    query_example(index, "Machine learning projects with computer vision")
    query_example(index, "Web application development with React")
    
    print("\nEmbedding process completed successfully!")

if __name__ == "__main__":
    main()