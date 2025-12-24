import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://gcmfonplskbsxfjqbfln.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbWZvbnBsc2tic3hmanFiZmxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM5NjYyNSwiZXhwIjoyMDgxOTcyNjI1fQ.Kncd-QJ2BVwnx137XAIUxNrQJjo8yfEKAJ9uIBpM74Q"
);

async function login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "rahul@gmail.com",
    password: "123456",
  });

  if (error) {
    console.error(error);
    return;
  }

  console.log("ACCESS TOKEN 👇");
  console.log(data.session.access_token);
}

login();
