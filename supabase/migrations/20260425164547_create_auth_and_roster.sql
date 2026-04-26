/*
  # Create auth and rosters schema

  1. New Tables
    - `rosters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `institution_name` (text)
      - `roster_purpose` (text)
      - `place_of_duty` (text)
      - `group_name` (text)
      - `roster_number` (text)
      - `week_start` (date)
      - `roster_data` (jsonb) - stores members, timings, duties
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `rosters` table
    - Add policy for authenticated users to view their own rosters
    - Add policy for authenticated users to create rosters
    - Add policy for authenticated users to update their own rosters
    - Add policy for authenticated users to delete their own rosters
*/

CREATE TABLE IF NOT EXISTS rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_name text DEFAULT '',
  roster_purpose text DEFAULT '',
  place_of_duty text DEFAULT '',
  group_name text DEFAULT '',
  roster_number text DEFAULT '1',
  week_start date,
  roster_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rosters"
  ON rosters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create rosters"
  ON rosters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rosters"
  ON rosters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rosters"
  ON rosters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
