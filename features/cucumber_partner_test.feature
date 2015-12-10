Feature: Test cucumber-partner
  As a user I would like cucumber partner to work correctly

  Background:
    Given I am using a desktop

  Scenario: Test Home page
    When I visit the home page
    Then I should eventually be on the home page