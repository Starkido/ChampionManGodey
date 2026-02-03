-- Create manual funding requests table
CREATE TABLE public.manual_funding_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  network TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_funding_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own funding requests"
ON public.manual_funding_requests
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own requests
CREATE POLICY "Users can submit funding requests"
ON public.manual_funding_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can manage all requests
CREATE POLICY "Admins can manage funding requests"
ON public.manual_funding_requests
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_manual_funding_requests_updated_at
BEFORE UPDATE ON public.manual_funding_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();