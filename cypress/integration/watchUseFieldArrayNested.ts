describe('watchUseFieldArrayNested', () => {
  it('should watch the correct nested field array', () => {
    cy.visit('http://localhost:3000/watchUseFieldArrayNested');

    cy.get('#result').contains(
      '[{"firstName":"Bill","keyValue":[{"name":"1a"},{"name":"1c"}],"lastName":"Luo"}]',
    );

    cy.get(`#nest-append-0`).click();
    cy.get(`#nest-prepend-0`).click();
    cy.get(`#nest-insert-0`).click();
    cy.get(`#nest-swap-0`).click();
    cy.get(`#nest-move-0`).click();

    cy.get('#result').contains(
      '[{"firstName":"Bill","keyValue":[{"name":"insert"},{"name":"prepend"},{"name":"1a"},{"name":"1c"},{"name":"append"}],"lastName":"Luo"}]',
    );

    cy.get('#nest-update-0').click();

    cy.get('#result').contains(
      '[{"firstName":"Bill","keyValue":[{"name":"billUpdate"},{"name":"prepend"},{"name":"1a"},{"name":"1c"},{"name":"append"}],"lastName":"Luo"}]',
    );

    cy.get(`#nest-remove-0`).click();

    cy.get('#submit').click();

    cy.get('#result').contains(
      '[{"firstName":"Bill","keyValue":[{"name":"billUpdate"},{"name":"1a"},{"name":"1c"},{"name":"append"}],"lastName":"Luo"}]',
    );

    cy.get('#prepend').click();
    cy.get('#append').click();
    cy.get('#swap').click();
    cy.get('#insert').click();

    cy.get('#result').contains(
      '[{"firstName":"prepend","keyValue":[]},{"firstName":"insert","keyValue":[]},{"firstName":"append","keyValue":[]},{"firstName":"Bill","keyValue":[{"name":"billUpdate"},{"name":"1a"},{"name":"1c"},{"name":"append"}],"lastName":"Luo"}]',
    );

    cy.get(`#nest-append-0`).click();
    cy.get(`#nest-prepend-0`).click();
    cy.get(`#nest-insert-0`).click();
    cy.get(`#nest-swap-0`).click();
    cy.get(`#nest-move-0`).click();

    cy.get('#result').contains(
      '[{"firstName":"prepend","keyValue":[{"name":"insert"},{"name":"prepend"},{"name":"append"}]},{"firstName":"insert","keyValue":[]},{"firstName":"append","keyValue":[]},{"firstName":"Bill","keyValue":[{"name":"billUpdate"},{"name":"1a"},{"name":"1c"},{"name":"append"}],"lastName":"Luo"}]',
    );

    cy.get('#nest-remove-3').click();
    cy.get('#nest-remove-3').click();

    cy.get('#result').contains(
      '[{"firstName":"prepend","keyValue":[{"name":"insert"},{"name":"prepend"},{"name":"append"}]},{"firstName":"insert","keyValue":[]},{"firstName":"append","keyValue":[]},{"firstName":"Bill","keyValue":[{"name":"billUpdate"},{"name":"append"}],"lastName":"Luo"}]',
    );

    cy.get('#nest-remove-all-3').click();
    cy.get('#nest-remove-all-2').click();
    cy.get('#nest-remove-all-1').click();
    cy.get('#nest-remove-all-0').click();

    cy.get('#result').contains(
      '[{"firstName":"prepend","keyValue":[]},{"firstName":"insert","keyValue":[]},{"firstName":"append","keyValue":[]},{"firstName":"Bill","keyValue":[],"lastName":"Luo"}]',
    );

    cy.get('#update').click();

    cy.get('#result').contains(
      '[{"firstName":"BillUpdate","keyValue":[]},{"firstName":"insert","keyValue":[]},{"firstName":"append","keyValue":[]},{"firstName":"Bill","keyValue":[],"lastName":"Luo"}]',
    );

    cy.get('#remove').click();
    cy.get('#remove').click();
    cy.get('#remove').click();

    cy.get('#result').contains('[{"firstName":"BillUpdate","keyValue":[]}]');

    cy.get('#count').contains('36');

    cy.get('#removeAll').click();

    cy.get('#result').should('have.value', '');
  });
});
