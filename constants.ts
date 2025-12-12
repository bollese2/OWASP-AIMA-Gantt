import { ProjectData, Task, Dependency } from './types';

const AIMA_DATA = {
  "Pillars": [
    {
      "Pillar": "Responsible AI",
      "Practices": [
        {
          "Practice": "Ethical Values and Societal Impact",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Incident-Driven: Ethical concerns addressed post-incident without consistent practices.",
                "Informal Accountability: Ethical responsibilities assigned ad-hoc with minimal documentation.",
                "Limited Follow-Up: Post-incident documentation with little structured learning or improvement."
              ],
              "Stream B": [
                "Occasional Discussions: Ethical topics addressed informally, typically driven by personal initiative.",
                "No Structured Training: Ethical training is absent or ad-hoc.",
                "Variable Awareness: Ethics understanding varies across teams."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Defined Ethical and Environmental Policy: Explicit policy outlines values, principles, and responsibilities.",
                "Ethics Governance: Designated Ethics Officers or Committees oversee ethical practices.",
                "Integrated Assessments: Ethical and Environmental impact assessments systematically embedded."
              ],
              "Stream B": [
                "Role-Specific Training: Ethics training tailored to roles conducted regularly.",
                "Supported Discussions: Encouraged open forums for ethical dilemmas.",
                "Routine Reflection: Ethical and Environmental considerations integrated into regular project activities."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Continuous Monitoring: Ethical and environmental KPIs actively tracked.",
                "Policy Evolution: Regular updates based on stakeholder feedback and real-world insights.",
                "Automated Integration: Ethics and environmental tools and processes embedded throughout all project lifecycle phases."
              ],
              "Stream B": [
                "Rewarded Ethics: Ethical behavior recognized in career progression.",
                "Cultural Reinforcement: Regular events and leadership modeling to reinforce proactive behavior.",
                "Normalized Decision-Making: Ethical considerations are standard across all organizational decision-making."
              ]
            }
          ]
        },
        {
          "Practice": "Transparency and Explainability",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Manual Documentation: Documentation created reactively, usually after issues arise.",
                "Informal Roles: Transparency responsibilities assigned ad-hoc.",
                "Contextual Gaps: Outputs frequently lack sufficient interpretability."
              ],
              "Stream B": [
                "Informal Awareness: Explainability discussed in informal settings; formal training absent.",
                "Voluntary Queries: Encouraged, but not required, model explanation requests.",
                "Individual-Driven: Transparency awareness driven by personal interest."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Defined Policy: Established transparency and explainability policy.",
                "Role Clarity: Champions appointed to ensure explainability.",
                "Standardized Tools: SHAP, LIME, and model cards embedded into development pipelines."
              ],
              "Stream B": [
                "Role-Based Training: Targeted training on interpretability techniques provided regularly.",
                "Systematic Retrospectives: Teams regularly review the clarity and impact of model explanations.",
                "Growing Consistency: Transparency practices standardized and shared more broadly."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Automated Processes: Explanation documentation automated and validated within CI/CD workflows.",
                "Real-Time Metrics: Transparency metrics continuously monitored.",
                "Automated Remediation: Trigger automatic remediation workflows when explanation standards are unmet."
              ],
              "Stream B": [
                "Performance Integration: Transparency effectiveness included in performance evaluations.",
                "Cultural Innovation: Organization-wide explainability events (e.g., hackathons).",
                "Open Dialogue: Institutional norms promote ongoing dialogue and continuous improvement."
              ]
            }
          ]
        },
        {
          "Practice": "Fairness and Bias",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Ad Hoc Response: Bias addressed inconsistently, primarily after complaints or incidents.",
                "Unclear Roles: Responsibilities assigned informally.",
                "Lack of Tools: No standardized tools for bias assessment."
              ],
              "Stream B": [
                "Limited Awareness: Cultural awareness driven by individual initiative without formal training.",
                "Informal Reporting: Reporting of bias concerns is voluntary and unstructured.",
                "No Defined Metrics: Absence of formal metrics for bias-related issues."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Defined Policies: Formal policies and governance forums guide bias mitigation.",
                "Tool Integration: Fairness assessment tools and documentation used at key project milestones.",
                "Regular Assessments: Regular bias evaluations conducted."
              ],
              "Stream B": [
                "Role-Specific Training: Regular fairness training tailored to specific roles.",
                "Feedback Mechanisms: Project retrospectives and knowledge sharing occur regularly.",
                "Partial Engagement: Fairness awareness present but inconsistently applied."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Automated Monitoring: Continuous, automated bias detection tools trigger real-time remediation.",
                "Enterprise-Wide Metrics: Fairness KPIs tracked organization-wide.",
                "Process Integration: Fairness assessments enforced through automated CI/CD pipelines."
              ],
              "Stream B": [
                "Incentivized Culture: Fairness integrated into career growth and performance reviews.",
                "Proactive Exercises: Regular red-team exercises and simulations.",
                "Continuous Enhancement: Active promotion of continuous improvement initiatives."
              ]
            }
          ]
        }
      ]
    },
    {
      "Pillar": "Governance",
      "Practices": [
        {
          "Practice": "Strategy and Metrics",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Minimal Alignment: AI security and RAI efforts are not consistently linked to business or ethical goals.",
                "Unclear Accountability: No formal ownership for AI security or ethical governance.",
                "Ad Hoc Processes: AI security actions happen on-demand."
              ],
              "Stream B": [
                "No Formal Metrics: AI security and RAI outcomes are not measured or measured informally.",
                "Incident-Driven Insights: Data is gathered primarily after incidents.",
                "Lack of Standardization: Reporting varies widely."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Documented Strategy: A formal AI security and RAI strategy exists.",
                "Clear Governance: Defined roles ensure accountability.",
                "Planned Integration: AI security and ethical oversight included in project roadmaps."
              ],
              "Stream B": [
                "Established Metric Set: KPIs/KRIs are tracked over time.",
                "Regular Collection & Reporting: Metrics gathered at intervals and shared.",
                "Action-Oriented Insights: Metrics drive resource allocation and improvements."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Fully Embedded: AI security and RAI strategy integrated into broader corporate governance.",
                "Executive Sponsorship: Senior leadership proactively supports AI security.",
                "Lifecycle Integration: Mandatory AI security controls throughout all AI development."
              ],
              "Stream B": [
                "Advanced Analytics & Monitoring: Real-time monitoring of AI systems.",
                "Predictive & Preventive Metrics: Metrics forecast and proactively address risks.",
                "Culture of Data-Driven and Ethical Governance: Metrics feed strategic decision-making."
              ]
            }
          ]
        },
        {
          "Practice": "Policy and Compliance",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Minimal AI-Specific Policies: AI risks are loosely covered by general IT/security policies.",
                "Reactive Updates: Policies change only after incidents or regulatory pressure.",
                "Limited Guidance: Teams lack clear instructions."
              ],
              "Stream B": [
                "Reactive Compliance: Efforts focus on ad-hoc responses to audits or incidents.",
                "Limited Oversight: No systematic tracking of AI-related regulations.",
                "Informal Risk Assessment: Assessments are inconsistent and undocumented."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Documented AI Policies & Standards: Formal requirements cover data use, model validation, etc.",
                "Periodic Reviews: Policies reviewed on a defined schedule.",
                "Consistent Application: Projects follow standards; exceptions require approval."
              ],
              "Stream B": [
                "Established Compliance Processes: Regular reviews align with known regulations.",
                "Consistent Risk Framework: A risk register tracks AI security and ethical posture.",
                "Internal Audit & Reporting: Findings are reported to governance bodies."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Integrated Policy Framework: AI policies embedded in enterprise governance.",
                "Proactive Evolution: Updates anticipate emerging threats and regulations.",
                "Automated Enforcement: CI/CD gates and policy-as-code tooling flag non-compliant artifacts."
              ],
              "Stream B": [
                "Holistic Compliance Integration: Real-time regulatory watchlists inform automatic updates.",
                "Advanced Risk Analytics: Continuous monitoring detects drift, bias, or anomalies.",
                "Benchmarking & Certification: The organization measures itself against leading frameworks."
              ]
            }
          ]
        },
        {
          "Practice": "Education and Guidance",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Ad-Hoc Learning: Security and ethics topics appear sporadically.",
                "Limited Reach: Only core engineering teams receive guidance.",
                "Informal Materials: Slide decks or wiki pages exist but are not curated."
              ],
              "Stream B": [
                "No Formal Measurement: Completion rates or adoption of guidance are not tracked.",
                "Reactive Improvements: Content is updated only when major issues arise.",
                "Knowledge Gaps Unidentified: The organization lacks insight into skill gaps."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Documented Curriculum: Mandatory courses cover AI-specific threats.",
                "Role Tailoring: Distinct learning paths for different roles.",
                "Guidance Library: Curated playbooks and checklists are integrated into day-to-day tools."
              ],
              "Stream B": [
                "Tracked Participation & Assessments: LMS tracks completion and scores.",
                "Feedback Loops: Learners rate relevance; course owners revise based on data.",
                "Skill Gap Analysis: Regular reviews map workforce skills to upcoming projects."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Just-In-Time Micro-Learning: Contextual tips appear in pipelines and notebooks.",
                "Community & Mentorship: Internal forums and guilds foster knowledge sharing.",
                "Automated Guidance Updates: New threat intel or policy changes automatically trigger content refresh."
              ],
              "Stream B": [
                "Performance-Linked Metrics: Training impact measured through defect density and incident trends.",
                "Adaptive Curriculum: AI identifies learning gaps and personalizes content.",
                "Benchmarking & Recognition: Organization compares learning maturity against industry and offers incentives."
              ]
            }
          ]
        }
      ]
    },
    {
      "Pillar": "Data Management",
      "Practices": [
        {
          "Practice": "Data Quality and Integrity",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Siloed Data",
                "Poor Quality",
                "No Validation"
              ],
              "Stream B": [
                "No Traceability",
                "Manual Handling",
                "Poor Auditability"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Initial Cleansing",
                "Early Standards",
                "Metadata Tracking"
              ],
              "Stream B": [
                "Partial Lineage",
                "Manual Change Tracking",
                "Inconsistent Controls"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Standardized Metrics",
                "Active Quality Management",
                "Curated Data"
              ],
              "Stream B": [
                "Full Traceability",
                "Automated Integrity Checks",
                "Proactive Compliance"
              ]
            }
          ]
        },
        {
          "Practice": "Data Governance and Accountability",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "No Formal Policies",
                "Undefined Roles",
                "Unstructured Governance"
              ],
              "Stream B": [
                "Undefined Ownership",
                "Documentation Gaps",
                "No Accountability"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Basic Governance Charter",
                "Initial Stewardship",
                "Policy Development"
              ],
              "Stream B": [
                "Partial Ownership Assignment",
                "Preliminary Documentation",
                "Informal Ethical Concerns"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Comprehensive Framework",
                "AI-Specific Policies",
                "Dynamic Adaptability"
              ],
              "Stream B": [
                "Enforced Accountability",
                "Incident Management",
                "Full Traceability"
              ]
            }
          ]
        },
        {
          "Practice": "Data Training",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Unstructured Collection",
                "No Labeling Standards",
                "Manual Validation"
              ],
              "Stream B": [
                "No Compliance Checks",
                "Unchecked Data Use",
                "Security Risk"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Guidelines Established",
                "Partial Validation",
                "Early-stage Curation"
              ],
              "Stream B": [
                "Initial Privacy Checks",
                "Licensing Awareness",
                "Bias Awareness"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Automated Pipelines",
                "Continuous Validation",
                "Dynamic Curation"
              ],
              "Stream B": [
                "Systematic Compliance",
                "Verified Usage Rights",
                "Robust Security Measures"
              ]
            }
          ]
        }
      ]
    },
    {
      "Pillar": "Privacy",
      "Practices": [
        {
          "Practice": "Data Minimization and Purpose Limitation",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Informal Approach",
                "Reactive Management",
                "Undefined Responsibilities"
              ],
              "Stream B": [
                "No Formal Monitoring",
                "Incident-Based Learning",
                "Lack of Metrics"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Documented Policies",
                "Defined Accountability",
                "Planned Compliance"
              ],
              "Stream B": [
                "Routine Monitoring",
                "Basic Metrics",
                "Proactive Adjustments"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Fully Integrated Practices",
                "Strategic Alignment",
                "Lifecycle Integration"
              ],
              "Stream B": [
                "Advanced Analytics",
                "Predictive Privacy Management",
                "Culture of Privacy Excellence"
              ]
            }
          ]
        },
        {
          "Practice": "Privacy by Design and Default",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Ad Hoc Practices",
                "Missing Standards",
                "Manual Communication"
              ],
              "Stream B": [
                "No Privacy Engineering",
                "Lack of Tools",
                "Reliance on Individuals"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Policy Adoption",
                "Assigned Roles",
                "Integrated Processes"
              ],
              "Stream B": [
                "Reusable Components",
                "Process Guidance",
                "Shared Tooling"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Automated Governance",
                "Code-Level Enforcement",
                "Data-Driven Review"
              ],
              "Stream B": [
                "Embedded PETs",
                "Integrated Safeguards",
                "Continuous Metrics"
              ]
            }
          ]
        },
        {
          "Practice": "User Control and Transparency",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Opaque Communication",
                "Generic Consent",
                "Unclear Ownership"
              ],
              "Stream B": [
                "Inconsistent UI",
                "No Design Standards",
                "Limited User Access"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Policy Enforcement",
                "Assigned Roles",
                "Reviewed Consent Flows"
              ],
              "Stream B": [
                "Standardized Interfaces",
                "Process Integration",
                "Consistent Access"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Measured Transparency",
                "Live Consent Tracking",
                "Contextual Explanations"
              ],
              "Stream B": [
                "Adaptive Components",
                "Feedback-Driven Design",
                "Comprehensive Control Panels"
              ]
            }
          ]
        }
      ]
    },
    {
      "Pillar": "Design",
      "Practices": [
        {
          "Practice": "Threat Assessment",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "High-Level Risks Identified",
                "Ad Hoc Documentation",
                "Limited Stakeholder Awareness"
              ],
              "Stream B": [
                "Use of Basic Checklists",
                "Informal Approach",
                "Limited Coverage"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Centralized Risk Inventory",
                "Severity Scores",
                "Regular Updates"
              ],
              "Stream B": [
                "Standardized Threat Modeling Process",
                "Structured Documentation",
                "Integrated into Development"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Automated Risk Monitoring",
                "Real-time Alerting",
                "Continuous Improvement"
              ],
              "Stream B": [
                "Full Automation of Threat Detection",
                "Integrated Alerts into Operational Tools",
                "Predictive Analytics"
              ]
            }
          ]
        },
        {
          "Practice": "Security Architecture",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Basic Isolation & Access Control",
                "Limited Runtime Protection"
              ],
              "Stream B": [
                "Baseline Security Features",
                "Informal Selection Criteria"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Runtime Guardrails",
                "Structured Deployment Processes"
              ],
              "Stream B": [
                "Standardized Monitoring & Observability",
                "Regular Metrics Review"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "AI-Driven Adversarial Detection",
                "Model Versioning & Rollback"
              ],
              "Stream B": [
                "Automated Patch Management & Scanning",
                "Continuous Improvement Cycles"
              ]
            }
          ]
        },
        {
          "Practice": "Security Requirements",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Baseline Ethical Guidelines",
                "Basic Compliance Measures",
                "General Awareness"
              ],
              "Stream B": [
                "Basic Data Provenance",
                "Manual Tracking",
                "Limited Visibility"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Standardized Bias & Fairness Tools",
                "Integrated Compliance Processes",
                "Structured Documentation"
              ],
              "Stream B": [
                "Automated Quality Checks",
                "Enhanced Provenance Records",
                "Structured Validation"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Real-Time Compliance Monitoring",
                "Expert Human Oversight",
                "Predictive Compliance Management"
              ],
              "Stream B": [
                "Real-Time Provenance Tracking",
                "Advanced Provenance Analytics",
                "Continuous Provenance Auditing"
              ]
            }
          ]
        }
      ]
    },
    {
      "Pillar": "Implementation",
      "Practices": [
        {
          "Practice": "Secure Build",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Ad hoc Model Selection",
                "Lack of Inventory",
                "Missing Provenance"
              ],
              "Stream B": [
                "Unchecked Licensing",
                "Vulnerability Gaps",
                "No Tooling"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Secure Guidelines",
                "Basic Model Review",
                "Inventory Control"
              ],
              "Stream B": [
                "I/O Controls",
                "Versioning",
                "Initial Validation"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Formal Risk Reviews",
                "Custody Controls",
                "Supplier Assurance"
              ],
              "Stream B": [
                "Adversarial Testing",
                "CI/CD Integration",
                "Edge Case Validation"
              ]
            }
          ]
        },
        {
          "Practice": "Secure Deployment",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Environment Capture",
                "Dependency Logging",
                "Manual Tracking"
              ],
              "Stream B": [
                "Basic Monitoring",
                "I/O Logging",
                "Usage Metrics"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Approval Workflows",
                "Rollback Plans",
                "Audit Trails"
              ],
              "Stream B": [
                "Access Restrictions",
                "Access Logging",
                "Encryption"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Compliance Checks",
                "Automation",
                "Audit Readiness"
              ],
              "Stream B": [
                "Resilience Design",
                "Drift Detection",
                "Alerting Systems"
              ]
            }
          ]
        },
        {
          "Practice": "Defect Management",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Defect Taxonomy",
                "Basic Tracking",
                "Initial Documentation"
              ],
              "Stream B": [
                "User Feedback Monitoring",
                "Regression Testing",
                "Alerting for Failures"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Defect Prioritization",
                "Workflow Integration",
                "Defect Analytics"
              ],
              "Stream B": [
                "Advanced Testing",
                "Scheduled Reevaluation",
                "Controlled Experiments"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Root Cause Analysis",
                "Knowledge Sharing",
                "Cross-Functional Review"
              ],
              "Stream B": [
                "Automated Pipelines",
                "Real-Time Monitoring",
                "Closed-Loop Learning"
              ]
            }
          ]
        }
      ]
    },
    {
      "Pillar": "Verification",
      "Practices": [
        {
          "Practice": "Security Testing",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Ad hoc security tests with no systematic approach.",
                "Reactive security activities triggered mainly by incidents.",
                "Limited understanding of AI-specific threats."
              ],
              "Stream B": [
                "No formal security metrics defined or tracked.",
                "Security insights derived primarily from incident response.",
                "Inconsistent or irregular reporting."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Structured AI security testing approach established.",
                "Defined responsibilities for conducting regular AI security assessments.",
                "AI security activities integrated into broader security testing efforts."
              ],
              "Stream B": [
                "Defined security metrics (incident frequency, robustness indicators).",
                "Regularly collected and reported security metrics.",
                "Metrics guide security improvements and resource allocation."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Comprehensive security testing integrated throughout the AI lifecycle.",
                "Advanced threat simulations.",
                "Dedicated AI security team actively adapting to emerging threats."
              ],
              "Stream B": [
                "Real-time monitoring and advanced analytics detecting AI-specific security threats.",
                "Predictive metrics forecasting vulnerabilities.",
                "Robust, continuous feedback loop driving strategic security enhancements."
              ]
            }
          ]
        },
        {
          "Practice": "Requirement-based Testing",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Testing is informal or inconsistently linked to requirements.",
                "Requirement traceability is limited or non-existent.",
                "Testing often reactive rather than planned."
              ],
              "Stream B": [
                "Minimal or no metrics related to requirement testing.",
                "Testing results documented irregularly.",
                "Limited stakeholder visibility into testing outcomes."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Formal testing process established with clear links to defined requirements.",
                "Responsibility for requirement-based testing clearly assigned.",
                "Regular execution of testing aligned with the AI lifecycle."
              ],
              "Stream B": [
                "Defined metrics (coverage, compliance rates, defect rates).",
                "Regular reporting of metrics to stakeholders.",
                "Metrics inform decisions and drive continuous improvement."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Requirement-based testing fully integrated into continuous development.",
                "Automated and continuous verification against requirements.",
                "Active use of feedback to refine testing and requirement definitions."
              ],
              "Stream B": [
                "Advanced analytics to continuously track and analyze requirement compliance.",
                "Predictive metrics anticipate issues proactively.",
                "Strong culture of accountability and continuous enhancement."
              ]
            }
          ]
        },
        {
          "Practice": "Architecture Assessment",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Architecture reviews informal or ad hoc.",
                "Limited awareness of AI-specific architecture standards.",
                "Reactive to architecture-related incidents."
              ],
              "Stream B": [
                "Few or no metrics related to architectural quality or security.",
                "Irregular documentation of assessment outcomes.",
                "Limited stakeholder engagement or reporting."
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Defined architecture review process integrated into AI projects.",
                "Clearly assigned responsibilities for architecture assessments.",
                "Regular architecture evaluations aligned with lifecycle milestones."
              ],
              "Stream B": [
                "Established metrics (compliance with architectural guidelines).",
                "Routine reporting to stakeholders.",
                "Metrics actively guide architecture improvements."
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Comprehensive and continuous architecture assessment embedded in the AI lifecycle.",
                "Proactive identification and remediation of architectural vulnerabilities.",
                "Active adaptation to emerging AI architectural best practices."
              ],
              "Stream B": [
                "Advanced metrics and analytics for real-time architectural monitoring.",
                "Predictive analytics proactively identifying potential architectural weaknesses.",
                "Strong organizational commitment to continuous architectural refinement."
              ]
            }
          ]
        }
      ]
    },
    {
      "Pillar": "Operations",
      "Practices": [
        {
          "Practice": "Incident Management",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Reactive Detection",
                "Ad Hoc Containment",
                "Minimal Analysis"
              ],
              "Stream B": [
                "Informal Reporting",
                "Limited Communication",
                "Sparse Post-Incident Review"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Standardized Protocols",
                "Defined Roles",
                "Consistent Workflows"
              ],
              "Stream B": [
                "Structured Communication",
                "Regular Reviews",
                "Tracked Improvements"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Automated Detection",
                "Integrated Forensics",
                "Adaptive Response"
              ],
              "Stream B": [
                "Proactive Notifications",
                "Detailed Reporting",
                "Continuous Improvement"
              ]
            }
          ]
        },
        {
          "Practice": "Event Management",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Manual Detection",
                "No Anomaly Detection",
                "Reactive Approach"
              ],
              "Stream B": [
                "Ad Hoc Management",
                "No Documentation",
                "Lack of Learning"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Basic Monitoring",
                "Initial Anomaly Detection",
                "Alerting Setup"
              ],
              "Stream B": [
                "Incident Logging",
                "Occasional RCA",
                "Partial Documentation"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Real-Time Monitoring",
                "ML-Driven Detection",
                "Proactive Alerts"
              ],
              "Stream B": [
                "Comprehensive Workflows",
                "Systematic RCA",
                "Continuous Learning Loop"
              ]
            }
          ]
        },
        {
          "Practice": "Operational Management",
          "MaturityLevels": [
            {
              "Level": "1",
              "Stream A": [
                "Manual Monitoring",
                "Reactive Maintenance",
                "Limited Coverage"
              ],
              "Stream B": [
                "Basic Compliance Awareness",
                "Ad Hoc Checks",
                "Minimal Documentation"
              ]
            },
            {
              "Level": "2",
              "Stream A": [
                "Scheduled Monitoring",
                "Preventive Maintenance",
                "Improved Stability"
              ],
              "Stream B": [
                "Standardized Security Practices",
                "Regular Audits",
                "Policy Alignment"
              ]
            },
            {
              "Level": "3",
              "Stream A": [
                "Automated Monitoring",
                "Continuous Optimization",
                "Proactive Resource Management"
              ],
              "Stream B": [
                "Automated Compliance Enforcement",
                "Integrated Security Audits",
                "Proactive Threat Mitigation"
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const generateInitialData = (): ProjectData => {
  const currentYear = new Date().getFullYear();
  const tasks: Task[] = [];
  const dependencies: Dependency[] = [];
  let globalIdCounter = 0;

  const addDays = (d: Date, days: number) => {
    const n = new Date(d);
    n.setDate(n.getDate() + days);
    return n;
  };

  const createTask = (
    name: string,
    cat: string,
    start: Date,
    duration: number,
    type: 'task' | 'milestone' | 'summary',
    parentId?: string,
    depth: number = 0,
    isExpanded: boolean = true
  ): Task => {
    globalIdCounter++;
    const end = addDays(start, duration);
    return {
      id: `t-${globalIdCounter}`,
      name,
      start,
      end,
      progress: 0,
      isActive: true,
      status: 'Not Started',
      assignee: "Unassigned",
      type,
      category: cat,
      parentId,
      depth,
      isExpanded
    };
  };

  AIMA_DATA.Pillars.forEach((pillar) => {
    const categoryName = pillar.Pillar;

    pillar.Practices.forEach((practice, pIdx) => {
      // Level 0: Practice
      const practiceStart = new Date(currentYear, 0, 1);
      const practiceTask = createTask(
        `Practice: ${practice.Practice}`,
        categoryName,
        practiceStart,
        360, // Full year roughly
        'summary',
        undefined,
        0,
        true
      );
      tasks.push(practiceTask);

      practice.MaturityLevels.forEach((level) => {
        // Level 1: Maturity Level
        let monthStart = 0;
        let durationDays = 90;
        
        if (level.Level === "1") { monthStart = 0; durationDays = 90; } // Jan 1
        else if (level.Level === "2") { monthStart = 3; durationDays = 90; } // Apr 1
        else if (level.Level === "3") { monthStart = 6; durationDays = 180; } // Jul 1

        const levelStart = new Date(currentYear, monthStart, 1);
        const levelTask = createTask(
          `Maturity Level ${level.Level}`,
          categoryName,
          levelStart,
          durationDays,
          'summary',
          practiceTask.id,
          1,
          false // Collapse levels by default to reduce noise
        );
        tasks.push(levelTask);

        // Level 2: Streams (A and B)
        const streams = [
          { name: "Stream A", items: level["Stream A"] },
          { name: "Stream B", items: level["Stream B"] }
        ];

        streams.forEach((stream) => {
           const streamTask = createTask(
             stream.name,
             categoryName,
             levelStart,
             durationDays,
             'summary',
             levelTask.id,
             2,
             true
           );
           tasks.push(streamTask);

           // Level 3: Individual Tasks
           const itemDuration = Math.floor(durationDays / (stream.items.length || 1)) - 5;
           
           stream.items.forEach((itemText, i) => {
              const itemStart = addDays(levelStart, i * (itemDuration + 5));
              const task = createTask(
                itemText,
                categoryName,
                itemStart,
                Math.max(itemDuration, 5),
                'task',
                streamTask.id,
                3
              );
              tasks.push(task);
           });
        });
      });
    });
  });

  return {
    title: "OWASP AIMA Maturity Program",
    year: currentYear,
    tasks,
    dependencies,
    teamMembers: ["Security Lead", "AI Engineer", "Legal", "Ops"]
  };
};