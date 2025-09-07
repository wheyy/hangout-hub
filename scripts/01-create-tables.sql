-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places table
CREATE TABLE public.places (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cafe', 'restaurant', 'park', 'mall', 'entertainment', 'sports', 'cultural')),
  amenities TEXT[] DEFAULT '{}',
  parking_available BOOLEAN DEFAULT false,
  parking_type TEXT CHECK (parking_type IN ('free', 'paid', 'limited')),
  parking_details TEXT,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  price_range TEXT NOT NULL CHECK (price_range IN ('free', 'budget', 'moderate', 'expensive')),
  opening_hours JSONB,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  max_participants INTEGER,
  is_location_sharing_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants table
CREATE TABLE public.session_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'maybe')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Location shares table (for real-time location sharing during active sessions)
CREATE TABLE public.location_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  accuracy DECIMAL(10,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_places_location ON public.places USING GIST (location);
CREATE INDEX idx_places_category ON public.places (category);
CREATE INDEX idx_places_rating ON public.places (rating DESC);
CREATE INDEX idx_sessions_creator ON public.sessions (creator_id);
CREATE INDEX idx_sessions_place ON public.sessions (place_id);
CREATE INDEX idx_sessions_scheduled_time ON public.sessions (scheduled_time);
CREATE INDEX idx_session_participants_session ON public.session_participants (session_id);
CREATE INDEX idx_session_participants_user ON public.session_participants (user_id);
CREATE INDEX idx_location_shares_session ON public.location_shares (session_id);
CREATE INDEX idx_location_shares_timestamp ON public.location_shares (timestamp DESC);
