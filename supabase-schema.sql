-- StarkFlow Database Schema for Supabase

-- Users table (created automatically by Supabase Auth, but we add a profile)
-- ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Holdings table - stores user's stock positions
CREATE TABLE IF NOT EXISTS holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  name TEXT,
  shares NUMERIC NOT NULL,
  avg_cost NUMERIC NOT NULL,
  current_price NUMERIC DEFAULT 0,
  change_amount NUMERIC DEFAULT 0,
  change_percent NUMERIC DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  total_gain NUMERIC DEFAULT 0,
  total_gain_percent NUMERIC DEFAULT 0,
  pe_ratio NUMERIC DEFAULT 0,
  dividend_yield NUMERIC DEFAULT 0,
  dividend_rate NUMERIC DEFAULT 0,
  ex_div_date TEXT,
  dividend_payment_date TEXT,
  dividend_frequency TEXT DEFAULT 'quarterly',
  next_earnings_date TEXT,
  sector TEXT DEFAULT 'Other',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Purchasing power table - stores user's cash balance
CREATE TABLE IF NOT EXISTS purchasing_power (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount NUMERIC DEFAULT 5000 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realized P/L table - stores realized gains from sold positions
CREATE TABLE IF NOT EXISTS realized_pl (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount NUMERIC DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - users can only access their own data
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchasing_power ENABLE ROW LEVEL SECURITY;
ALTER TABLE realized_pl ENABLE ROW LEVEL SECURITY;

-- Create policies for users to access their own data
CREATE POLICY "Users can view their own holdings" ON holdings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings" ON holdings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings" ON holdings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings" ON holdings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own purchasing power" ON purchasing_power
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own purchasing power" ON purchasing_power
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchasing power" ON purchasing_power
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own realized P/L" ON realized_pl
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own realized P/L" ON realized_pl
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own realized P/L" ON realized_pl
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-create purchasing_power and realized_pl when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO purchasing_power (user_id, amount)
  VALUES (NEW.id, 5000);
  
  INSERT INTO realized_pl (user_id, amount)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create records on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable realtime for holdings (optional, for future multi-device sync)
-- ALTER PUBLICATION supabase_realtime ADD TABLE holdings;
