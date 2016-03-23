Feature: Test tamarin
  As a user I would like tamarin to work correctly

  Background:
    Given I am using a desktop
    Then I should be using a desktop

  Scenario: Test Home page
    Given I visit the home page
    Then I should eventually be on the home page
    When I click the widgets menu link
    Then I should eventually be on the widgets page
    Then the description should eventually be "some text"
    Then the home menu link should have a title of home
    When I click the home menu link
    Then I should eventually be on the home page
    When I click the widget menu link
    Then I should eventually be on the widget page
    When I type "Freddy" into the name input
    Then the value of the name input should be "Freddy"
    When I click the home menu link
    Then I should eventually be on the home page
    When I click the bad menu link
    Then I should eventually be on the bad page
    Then the error message text should contain "not the page"
    When I click the widgets menu link
    Then I should eventually be on the widgets page
    And the error message should not exist
    And I expect to see a list of 5 widgets
