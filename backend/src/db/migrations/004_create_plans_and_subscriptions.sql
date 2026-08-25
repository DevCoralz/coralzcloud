-- Plans are defined server-side (not user-editable). Billing/checkout
-- logic is out of scope for this phase — this just gives future
-- subscription work a clean place to live, and lets us default every
-- user onto a free plan today.
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  storage_limit_bytes BIGINT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO plans (slug, name, storage_limit_bytes, price_cents)
VALUES ('free', 'Free', 5368709120, 0); -- 5 GiB

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans (id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX subscriptions_active_user_idx ON subscriptions (user_id) WHERE status = 'active';

CREATE TRIGGER subscriptions_set_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Every new user is automatically subscribed to the free plan.
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_id, status)
  SELECT NEW.id, id, 'active' FROM plans WHERE slug = 'free';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_create_default_subscription
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- DOWN
DROP TRIGGER IF EXISTS users_create_default_subscription ON users;
DROP FUNCTION IF EXISTS create_default_subscription();
DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON subscriptions;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS plans;
