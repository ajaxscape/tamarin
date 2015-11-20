@submission-list
Feature: Submission-list feature
  As a user of this site
  I would like to visit the submission list page

  Background:
    Given I am signed in

  Scenario: Land on home page as a visitor
    When I visit the submission list page
    Then I click submit new paper
