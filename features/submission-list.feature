@submission-list
Feature: Submission-list feature
  As a user of this site
  I would like to visit the submission list page

  Background:
    Given I am signed out

  Scenario: Land on home page as a visitor
    Given I visit the submission list page
    Then I expect the page title to be Sign-in
