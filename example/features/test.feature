Feature: Test tamarin
  As a user I would like tamarin to work correctly

  Background:
    Given I am logged out

  Scenario: Load the Home page, force login, fail
    Given I create a valid user
    And I visit the home page
    Then I should be on the login page
    And the login error is not displayed
    When I login as an invalid user
    Then I should be on the login page
    And the login error is displayed

  Scenario: Load the Home page forces login, success
    Given I create a valid user
    And I visit the home page
    Then I should be on the login page
    When I login as a valid user
    Then I should be on the home page

  Scenario: Add 2 widgets
    Given I create a valid user
    And I login and visit the widgets page
    When I add a widget
    And  I add another widget
    Then I should have 2 widgets

  Scenario: Delete a widget
    Given I login and visit the widgets page
    Then I should have 2 widgets
    When I remove the last widget
    Then I should have 1 widget

  Scenario: Delete a widget
    Given I login and visit the first widget
    Then I expect the first widget to be displayed correctly

#    Then the description should eventually be "some text"
#    Then the home menu link should have a title of home
#    When I click the home menu link
#    Then I should eventually be on the home page
#    When I click the widget menu link
#    Then I should eventually be on the widget page
#    When I type "Freddy" into the name input
#    Then the value of the name input should be "Freddy"
#    When I click the home menu link
#    Then I should eventually be on the home page
#    When I click the bad menu link
#    Then I should eventually be on the bad page
#    Then the error message text should contain "not the page"
#    When I click the widgets menu link
#    Then I should eventually be on the widgets page
#    And the error message should not exist
#    And I expect to see a list of 5 widgets
