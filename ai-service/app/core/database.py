from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """
    Returns a Supabase client instance.
    This client should be reused for all DB interactions.
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


# If you want a singleton client (recommended)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
