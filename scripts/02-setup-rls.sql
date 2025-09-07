-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_shares ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Places policies (public read access)
CREATE POLICY "Anyone can view places" ON public.places
  FOR SELECT USING (true);

-- Sessions policies
CREATE POLICY "Users can view sessions they created or are invited to" ON public.sessions
  FOR SELECT USING (
    auth.uid() = creator_id OR 
    EXISTS (
      SELECT 1 FROM public.session_participants 
      WHERE session_id = sessions.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Session creators can update their sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Session creators can delete their sessions" ON public.sessions
  FOR DELETE USING (auth.uid() = creator_id);

-- Session participants policies
CREATE POLICY "Users can view participants of sessions they're involved in" ON public.session_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE id = session_id AND (
        creator_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.session_participants sp2 
          WHERE sp2.session_id = sessions.id AND sp2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Session creators can manage participants" ON public.session_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE id = session_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participation status" ON public.session_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Location shares policies
CREATE POLICY "Users can view location shares for sessions they're in" ON public.location_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.session_participants 
      WHERE session_id = location_shares.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can share their own location" ON public.location_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location shares" ON public.location_shares
  FOR UPDATE USING (auth.uid() = user_id);
