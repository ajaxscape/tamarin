Feature: Test cucumber-partner
  As a user I would like cucumber partner to work correctly

  Background:
    Given I am using a desktop

  Scenario: Test Home page
    Given I visit the home page
    Then I should eventually be on the home page
    When I click the widgets link
    Then I should eventually be on the widgets page
