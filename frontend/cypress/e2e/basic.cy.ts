describe("Basic E2E", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("should register a new user", () => {
		cy.get('a[href="/register"]').click();

		cy.get("#username").type("testuser");
		cy.get("#password").type("password123");
		cy.get("#confirmPassword").type("password123");

		cy.get('button[type="submit"]').click();

		cy.get(".notification").should(
			"contain",
			"¡Registro exitoso! Redirigiendo a inicio de sesión en 5 segundos...",
		);
	});

	it("should login with existing user", () => {
		cy.get("#username").type("testuser");
		cy.get("#password").type("password123");

		cy.get('button[type="submit"]').click();

		cy.url().should("include", "/dashboard");
	});
});
