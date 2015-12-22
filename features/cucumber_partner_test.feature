Feature: Test cucumber-partner
  As a user I would like cucumber partner to work correctly

  Background:
    Given I am using a desktop

  Scenario: Test Home page
    Given I visit the home page
    Then I should eventually be on the home page
    When I click the widgets link
    Then I should eventually be on the widgets page
    Then the description should eventually be "some text"
    When I click the home link
    Then I should eventually be on the home page
    When I click the widget link
    Then I should eventually be on the widget page
    When I type "Freddy" into the name input
    Then the value of the name input should be "Freddy"
    When I click the home link
    Then I should eventually be on the home page
    When I click the bad link
    Then the error message text should contain "not the page"
    When I click the widgets link
    Then I should eventually be on the widgets page
