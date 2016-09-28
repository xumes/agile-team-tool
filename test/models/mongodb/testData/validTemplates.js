// have to put it on a separate file, quite long
module.exports =  {
    "cloudantId" : "ag_ref_atma_components_v01",
    "version" : 1,
    "status" : "inactive",
    "components" : [ 
                  {
                      "name" : "Agile Leadership and Collaboration",
                      "principles" : [ 
                          {
                              "id" : 1,
                              "name" : "Collaboration and Teamwork",
                              "practices" : [ 
                                  {
                                      "id" : 1,
                                      "name" : "Standups",
                                      "description" : "A regular team collaboration opportunity for sharing progress, identifying risks and resolving issues",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "No regular team opportunity for sharing progress on work", 
                                                  "Typically meetings maybe long and have limited engagement from attendees", 
                                                  "Meeting attendees are forced or feel obliged to attend rather than recognizing the value of the meeting and voluntarily attending", 
                                                  "Team members are unclear what work is happening or issues blocking progress", 
                                                  "Team members typically perform additional reporting to highlight work completed"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Standup meetings happen but are irregular", 
                                                  "Core team attendance maybe intermittent", 
                                                  "Team member updates are focus only on status with limited insight into risks or issues"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Standup meetings occur regularly but are usually initiated by the Iteration Manager/Project Manager or another facilitator", 
                                                  "At each meeting, all of the core team members answer the three questions 'What I have done since we last met', 'What I plan to do before we next meet', 'What is blocking me or may block me'", 
                                                  "Geographically remote team members are involved in Standup meetings through telephone"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Standup meetings are rarely missed by any core team member and still occur regardless of attendance", 
                                                  "Core team members use the visual wall and point to the work they are doing while answering the 3 questions", 
                                                  "Standups are completed in under 15mins", 
                                                  "Project stakeholders regularly attend standups and other team collaboration events", 
                                                  "Geographically remote team members feel properly included in Standups and are able to see and hear progress updates", 
                                                  "Blockers and challenges identified during the standup are assigned an owner, so that the impediment can be removed"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 2,
                                      "name" : "Track & Visualize Progress (Walls)",
                                      "description" : "Tracking progress of work and visualizing to create transparency and shared understanding ",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Project information is stored in locations with restricted access", 
                                                  "Not all stakeholders have access to project information", 
                                                  "Information is either not maintained or accurate"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "A basic wall exists representing project information and is accessible to all team members and stakeholders", 
                                                  "Information is intermittently maintained"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Information is maintained and accurate and is sufficient to describe current work, backlog, risks, issues and overall progress", 
                                                  "All work activities are represented on a wall, i.e.. greater than 4 hrs", 
                                                  "The team is proud to show visitors the visual management tools used, which also explain what the team does", 
                                                  "The team collaborate around the 'wall' regularly"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Priority, size, current state and ownership of the work is a true reflection of reality", 
                                                  "Information is kept regularly updated and team members hold each other accountable for their work", 
                                                  "The work backlog is displayed for at least one month of upcoming work", 
                                                  "Team members remotely located are able to view and update project wall"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }, 
                          {
                              "id" : 2,
                              "name" : "Focus on the Customer and Business Value",
                              "practices" : [ 
                                  {
                                      "id" : 3,
                                      "name" : "Engaging the Product Owner",
                                      "description" : "through showcases, planning, progress and team meetings to support definition and prioritization",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Team has no understanding of who the Product Owner is", 
                                                  "Product Owner is not involved in work planning"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Product Owner has been identified", 
                                                  "Product Owner involved in initial definition of work", 
                                                  "Product Owner reviews work post-delivery or during an acceptance testing phase"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Product Owner is involved in verifying the definition of work", 
                                                  "Product Owner may not always be available to team but makes time to answer questions and provides direction as required", 
                                                  "Product Owner attends the majority of showcases"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Minimum viable product/scope is defined and agreed with Product Owner(s)", 
                                                  "All work is prioritized weekly into a single backlog by value and risk across all Product Owners for your team", 
                                                  "Release plan is visible to all Product Owner(s) and is regularly updated based on evidence of progress"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 4,
                                      "name" : "Work Prioritization",
                                      "description" : "Effective work prioritization ensures that the greatest business value is always being delivered thereby maximizing return on investment.",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Pipeline / Backlog of work is non-existent", 
                                                  "Some backlog exists but there are no standards or processes in place to prioritize and manage the backlog"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "A backlog of work exists", 
                                                  "A process is in place to estimate the backlog items based on time/effort", 
                                                  "Planning is done on a regular basis, using the backlog item estimates", 
                                                  "There is no shared understanding of what is to be traded-off between scope, time, cost, or quality (no trade-off sliders)"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Backlog items are estimated using a relative scale", 
                                                  "The backlog is prioritized by value and risk, as well as effort", 
                                                  "Dependencies with other work outside the team are recognized and some effort is made to include this in setting priorities", 
                                                  "The delivery rate is tracked as velocity or cycle time"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Trade-off sliders are understood by all and used to guide decisions relating to Time, Cost, Scope and Quality", 
                                                  "Dependencies with other work outside the team are prioritized and included in planning"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }, 
                          {
                              "id" : 3,
                              "name" : "Flexible, Adaptive and Continuously Improving",
                              "practices" : [ 
                                  {
                                      "id" : 5,
                                      "name" : "Adaptive Planning (Release and Iteration Planning)",
                                      "description" : "The collaborative identification, definition and planning of work and deliverables",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "No plans exist (release or iteration)", 
                                                  "Plans are created without input from team before delivery", 
                                                  "Plans are based upon one major release without consideration of smaller incremental releases."
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Release Plans and Iteration Plans are defined by the Project Manager/Iteration Manager with limited involvement from the core team and with limited consideration of business priority or involvement of stakeholders", 
                                                  "Release Plans and Iterations Plans are not adjusted to reflect changing priorities.", 
                                                  "Variations in planned vs. delivered are not consistently measured or reported."
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Key stakeholders (sponsors, business owners and steering committee members) attend some project ceremonies (showcases and planning sessions)", 
                                                  "Release Plans and Iterations Plans are visible to the team", 
                                                  "Variations in planned vs. delivered are measured and reported.", 
                                                  "Release Plans and Iterations Plans are not adjusted due to variations in planned vs. delivered work."
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Key stakeholders (sponsors, business owners and steering committee members) attend most project ceremonies (showcases and planning sessions)", 
                                                  "Release and iteration planning produces an achievable plan that the team is confident to deliver", 
                                                  "Work planned is regularly achieved with only small variations in progress", 
                                                  "An overall (long-term) plan is maintained and accurately reflects the team's understanding of work, timing, resources, dependencies, etc.", 
                                                  "Sliders are used to inform planning"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 6,
                                      "name" : "Retrospectives",
                                      "description" : "A team activity used for problem identification and solution forming the basis for continuous improvement",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "No continuous improvement practices are being used to evolve work practices", 
                                                  "Decisions are made on the fly and lack factual basis", 
                                                  "Solutions are implemented without an understanding of the problem", 
                                                  "Post implementation reviews are used as the only source of feedback"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Retrospectives happen but are irregular", 
                                                  "Retrospectives have poorly defined actions", 
                                                  "Actions are not followed through or are ineffective"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Retrospectives are regular with actions being generated", 
                                                  "Retrospectives are generally facilitated by the same person", 
                                                  "Retrospective attendance is inconsistent", 
                                                  "Decisions are taken using root-cause analysis but decisions are often revisited"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Retrospectives are consistently attended by the core team who actively contribute to concrete adaptions/actions", 
                                                  "Actions are reliability completed", 
                                                  "Decisions are fact-based, addressing the root-cause of the problems and rarely need to be revisited"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 7,
                                      "name" : "Work Estimation (Relative Estimates)",
                                      "description" : "Relative estimations of work (both effort and cost) are essential for planning",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Time and Effort to complete work is not understood", 
                                                  "Customer commitments cannot be guaranteed"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "The unit of estimation is elapsed time", 
                                                  "The amount of work committed to an iteration is not compared with the actual work completed", 
                                                  "Core team members participate in the estimation techniques"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Over the last 3 months, work committed to an iteration has been accurate to within 50% of the work actually completed", 
                                                  "Estimates are compared against similar work items during the iteration planning cycle", 
                                                  "Estimates are reviewed at every release planning cycle", 
                                                  "Extended team participate in estimation techniques"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "The unit of estimation is relative effort", 
                                                  "Over the last 4 months, work committed to an iteration has been accurate to within 30% of the work actually completed", 
                                                  "Estimates for stories planned for future iterations are changed based on past progress", 
                                                  "Estimates are used to control the amount of work pulled into an iteration"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }, 
                          {
                              "id" : 4,
                              "name" : "Iterative and Fast",
                              "practices" : [ 
                                  {
                                      "id" : 8,
                                      "name" : "Work Break Down (Stories)",
                                      "description" : "Features and Stories capture and communicate the work that is needed in small well defined pieces",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Work is not well defined or structured", 
                                                  "Work is captured using detailed specification documents", 
                                                  "No consideration or attempt to decompose work into meaningful pieces"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Project Scope is mapped onto Features", 
                                                  "Features are used to describe the work from a high level that can be used for planning and progress tracking purposes", 
                                                  "Features are prioritized into a Release Plan"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "For the current release", 
                                                  "Features are broken into Stories.", 
                                                  "Stories are used to describe all work activities using language/words that the customer understands", 
                                                  "Features and Stories are recorded in a manner that is readily accessible by all team members and regularly maintained", 
                                                  "For future releases", 
                                                  "Features are described using language/words that the customer understands", 
                                                  "Features are recorded in a manner that is readily accessible by the project team"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "For the current release", 
                                                  "All Stories describe the business outcome (i.e. value), have an estimate and a priority", 
                                                  "The Product Owner reviews and priorities Stories prior to work commencing", 
                                                  "Relevant stakeholders (Analyst, Developer, Tester, Subject Matter Expert) are involved in defining and elaborating stories", 
                                                  "Acceptance Criteria are defined and agreed for each Story", 
                                                  "A Story should be able to be delivered within half an Iteration of effort"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }, 
                          {
                              "id" : 5,
                              "name" : "Empowered and Self Directed Teams",
                              "practices" : [ 
                                  {
                                      "id" : 9,
                                      "name" : "Stable Cross-Functional Teams",
                                      "description" : "Cross-functional teams have all competencies needed to accomplish the work without depending on others not part of the team. The team is designed to optimize flexibility, creativity, and productivity",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Team members work ONLY within defined roles", 
                                                  "Balance of team skills is inappropriate"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "The team is composed of staff that represent all of the required roles and skills", 
                                                  "The appropriate proportion of skills available within the team"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "The team is able to recruit new members easily", 
                                                  "The team is involved in the recruitment and selection process"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "The team is able to easily transition from current work to work of a different type"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 10,
                                      "name" : "Social Contract",
                                      "description" : "A living document, with the mutual expectations and agreements of the team and is prominently posted in the team area (if the team is co-located) or in a wiki, which is easily accessible",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Agile values are NOT understood or respected", 
                                                  "Team is ambivalent towards continuous improvement and self-development"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "All team members understand and exhibit Agile values"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Team values are agreed and represented by visible social contract and non-compliant behaviors are called out by team members"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "The whole team recognize quality issues and prioritizes remediation activities"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 11,
                                      "name" : "Risk and Issue Management",
                                      "description" : "Risk and Issue management addresses uncertainty and increases the likelihood of successful outcomes",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "There is NO awareness of current risks or issues"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Risks and Issues have been identified and are captured using an appropriate artifacts such as a Risk Story Walls, Big Visual Charts (BVC), Risk Register, etc.", 
                                                  "Risks and Issue are identified by an appropriate group of stakeholders (i.e. not just the project manager or the team leader in isolation)", 
                                                  "Risk artifacts are 'owned' by the team and team members have no reservations in making contributions or changes"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Risk management is embedded into day-to-day operations or project activities", 
                                                  "Risks, issues and blockers are discussed in appropriate detail as part of all sessions (stand-ups; iteration planning; showcases; steering committee meetings; etc).", 
                                                  "Risk mitigations and action plans are treated like any other activity or feature; they are represented by individual story cards, included in iteration planning and tracked and completed during the iteration."
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Risk mitigations and action plans take into consideration the source and cause of a risk", 
                                                  "Risks, assumptions, issues, dependencies, constraints (etc) identified previously are periodically revisited, discussed, reviewed and updated", 
                                                  "Risk Management is used to identify potential impacts on benefits, goals, objectives, strategies, problems, and success criteria.", 
                                                  "Mechanisms exist for reporting and escalating risks and issues which are beyond the capabilities or authority of the team"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }
                      ]
                  }, 
                  {
                      "name" : "Delivery",
                      "principles" : [ 
                          {
                              "id" : 1,
                              "name" : "Continuous Development",
                              "practices" : [ 
                                  {
                                      "id" : 1,
                                      "name" : "Automated builds & Continuous Integration",
                                      "description" : "Automated builds & Continuous Integration",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Builds require frequent manual intervention", 
                                                  "Build integrations are planned events", 
                                                  "Unit testing is done manually"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Code checked-in conforms to team coding standards", 
                                                  "Associated automated unit tests are also checked in", 
                                                  "Developers are automatically notified by the build system if their code breaks the build", 
                                                  "Some unit test cases exist, maybe created after development, and are periodically executed"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Any one of the following error conditions automatically results in a build break/failed build: automated unit test error, static code analysis error, build verification test error", 
                                                  "Production ready code (no error conditions in build/integration) is used as the primary measure of project progress", 
                                                  "Automated monitoring & reporting of automated test execution is in place", 
                                                  "Mixture of unit test cases written before and after development and the team is getting close to 80% code coverage for new code"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Agile Development (SCRUM, XP, other) is the only way the team works", 
                                                  "Continuous improvements in development, test, architecture, builds, automation are easily shown", 
                                                  "Test driven development is pervasively used by the team"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 2,
                                      "name" : "Managing Technical Debt",
                                      "description" : "coding decisions that work quickly, but might cause long-term problems",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Understand the need to manage and reduce technical debt", 
                                                  "Limited action to proactively reduce technical debt"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Business objectives include drastically reducing technical debt across one or more releases"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Manage technical debt at the appropriate level for the team"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Teams spend 20% or more of the iteration effort to reduce and prevent technical debt in a disciplined manner"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 3,
                                      "name" : "Dev & Ops Collaboration / Shared Understanding",
                                      "description" : "*Dev = all roles involved in development",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Dev and Ops work together but engagement is through cumbersome processes", 
                                                  "Delivery teams are engaged only at time of move-to-production", 
                                                  "Dev and Ops are not measured on the same outcomes"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Development and operations teams understand the need for close collaboration Early involvement of the operations team (prior to deployment) exists but is not pervasive"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Close collaboration exists across the whole team", 
                                                  "Everyone understands the current feature and how it is expected to behave in production", 
                                                  "Whole team completes all necessary work to deliver the feature", 
                                                  "Development and Operations review each other's metrics"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Whole team ownership beyond organizational boundaries", 
                                                  "Everyone is measured on deployment success", 
                                                  "Whole team supports production", 
                                                  "Ops creates automated test cases that support their acceptance criteria"
                                              ]
                                          }
                                      ]
                                  }, 
                                  {
                                      "id" : 4,
                                      "name" : "Infrastructure Automation / Provisioning",
                                      "description" : "Infrastructure Automation / Provisioning",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Environments manually built", 
                                                  "Environment builds, scaling, migrations, and failure recovery are time consuming", 
                                                  "Difficult to achieve environment consistency"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Tools are used to improve scaling", 
                                                  "Development and test environments are often consistent", 
                                                  "Only part of the environment is automatically provisioned"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Environments are predominantly consistent but require manual effort", 
                                                  "Automatically provision some environments"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Automatically provision ALL environments", 
                                                  "PaaS enables consistency across environments", 
                                                  "Infrastructure as code, enables developer self service via the structured and reliable management of configuration and provisioning scripts", 
                                                  "Environment scaling is automatic"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }, 
                          {
                              "id" : 2,
                              "name" : "Continuous Testing",
                              "practices" : [ 
                                  {
                                      "id" : 5,
                                      "name" : "Automated Testing",
                                      "description" : "Automated Testing",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Testing occurs after development and unit test (DCUT)", 
                                                  "Test environments are set up manually", 
                                                  "Testing is manual", 
                                                  "Testing is done simply to ensure the functionality satisfies the specified requirements (i.e., minimal customer focus)"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Continuous integration with static code analysis (analyzing code when not running) and build verification testing", 
                                                  "Test cases align with the acceptance criteria for a given user story, epic, scenario, use-case, etc.", 
                                                  "Developers execute their own 'personal builds' and run their own tests prior to committing code"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Some funcational and acceptance testing is automated", 
                                                  "Test data created, under change control, and automatically deployed to appropriate test environments", 
                                                  "Automatically report failing tests against the build and log problems to owners"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Testing (regression, functional acceptence, unit test, system and integration) is automated and executed as needed", 
                                                  "Test environments are under change control", 
                                                  "Any version of a test environment can be recreated automatically", 
                                                  "Test failures can be reproduced by automation recreating the failure environment", 
                                                  "Teams monitor code coverage for tests and ensure it is appropriate for their application"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }, 
                          {
                              "id" : 3,
                              "name" : "Continuous Release & Deployment",
                              "practices" : [ 
                                  {
                                      "id" : 6,
                                      "name" : "Automated Deployments",
                                      "description" : "Automated Deployments",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Deployment processes standardized and documented", 
                                                  "Deployments require significant manual effort and pre-planning"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Automated deployment for development and test environments only"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Automated deployment for all environments", 
                                                  "Automated deployments use pattern-based provisioning", 
                                                  "Version control is pervasive in deployment"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Compliance checks are fully automated", 
                                                  "Deployments are 'push-button' events", 
                                                  "No downtime is needed to deploy a new version", 
                                                  "Automatic rollback is available and requires no downtime", 
                                                  "Feature releases are decoupled from code deployments"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }, 
                          {
                              "id" : 4,
                              "name" : "Continuous Feedback & Optimization",
                              "practices" : [ 
                                  {
                                      "id" : 7,
                                      "name" : "Customer Feedback",
                                      "description" : "Customer term means your end-user.",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Slow customer feedback", 
                                                  "Feedback does not get to developers", 
                                                  "Customer/End-User is not part of the whole team"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Feedback gets to developers but not directly from customers", 
                                                  "No tools to track feature usage"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Customer usage of features is tracked via a few tools", 
                                                  "Customer feedback and insight is used to plan future releases", 
                                                  "Customers provide direct feedback and request new features through dedicated channels"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "Customers provide feedback throughout the entire lifecycle", 
                                                  "Team is able to predict new features", 
                                                  "Customer is a part of the whole team", 
                                                  "Feedback is automated and integrated in the continuous delivery pipeline"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }, 
                          {
                              "id" : 5,
                              "name" : "Continuous Monitoring",
                              "practices" : [ 
                                  {
                                      "id" : 8,
                                      "name" : "Monitoring of Environments",
                                      "description" : "Monitoring of Environments",
                                      "levels" : [ 
                                          {
                                              "name" : "Initiating",
                                              "score" : 1,
                                              "criteria" : [ 
                                                  "Manual availability and performance monitoring", 
                                                  "Operations personnel are notified manually when a problem occurs"
                                              ]
                                          }, 
                                          {
                                              "name" : "Practicing",
                                              "score" : 2,
                                              "criteria" : [ 
                                                  "Few tools for performance and availability monitoring", 
                                                  "System provides reactive notification of problems"
                                              ]
                                          }, 
                                          {
                                              "name" : "Transforming",
                                              "score" : 3,
                                              "criteria" : [ 
                                                  "Environments are instrumented to detect any problems (e.g., performance issues, network issues) and automatically send notifications"
                                              ]
                                          }, 
                                          {
                                              "name" : "Scaling",
                                              "score" : 4,
                                              "criteria" : [ 
                                                  "A dashboard with performance and availability data is available to whole team", 
                                                  "Analytics are used to analyze trends and predict protential problems", 
                                                  "Production environment is automatically optimized to conform immediately to customer usage patterns"
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }
                      ]
                  }
        ]
    };