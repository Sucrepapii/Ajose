describe("Row Level Security (RLS) Tests", () => {
  const supabaseUrl = Cypress.env("NEXT_PUBLIC_SUPABASE_URL") || "https://zivlydwhgofbnhgofbnh.supabase.co";
  const anonKey = Cypress.env("NEXT_PUBLIC_SUPABASE_ANON_KEY") || "dummy-anon-key";

  it("should prevent anonymous access to transactions table", () => {
    cy.request({
      method: "GET",
      url: `${supabaseUrl}/rest/v1/transactions?select=*`,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`
      },
      failOnStatusCode: false
    }).then((res) => {
      // In Supabase, if RLS is enabled and blocks read, it either returns 401/403 or an empty array (200)
      // depending on the policy and table structure. A 4xx indicates proper blockage or empty 200.
      if (res.status === 200) {
        expect(res.body).to.be.an('array').that.is.empty;
      } else {
        expect(res.status).to.be.oneOf([401, 403, 406]);
      }
    });
  });

  it("should prevent anonymous inserts into groups table", () => {
    cy.request({
      method: "POST",
      url: `${supabaseUrl}/rest/v1/groups`,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json"
      },
      body: {
        name: "Hacked Group",
        contribution_amount: 1000000
      },
      failOnStatusCode: false
    }).then((res) => {
      // Should fail with unauthorized or forbidden
      expect(res.status).to.be.oneOf([401, 403, 404]);
    });
  });
});
