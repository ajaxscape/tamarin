@submission-list
Feature: Submission-list feature
  As a user of this site
  I would like to visit the submission list page

  Background:
    Given I am signed in
#    Then I should eventually be on the new submission list page

  Scenario: Land on home page as a visitor
    When I visit the submission list page
    And I click submit new paper
    Then I should eventually be on the new submission page
