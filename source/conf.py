# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

import os

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'Telematik Spezifikation'
copyright = '2023, Erik Münz'
author = 'Erik Münz'
release = '0.1'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['sphinxcontrib.plantuml',
              'sphinx_needs']

templates_path = ['_templates']
exclude_patterns = []

language = 'de'


# -- Settings for PlantUML support -------------------------------------------
# https://sphinx-needs.readthedocs.io/en/latest/installation.html#plantuml-support

on_rtd = os.environ.get('READTHEDOCS') == 'True'
if on_rtd:
    plantuml = 'java -Djava.awt.headless=true -jar /usr/share/plantuml/plantuml.jar'
else:
    plantuml = 'java -jar %s' % os.path.join(os.path.dirname(__file__), "..", "utils", "plantuml.jar")

    plantuml_output_format = 'svg'

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

# -- Configuration of sphinx-needs -------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

needs_build_json = True
needs_id_regex = '^[A-Za-z0-9_]{5,}'

# -- Custom configuration of need typtes
# -- any configuration is possible, organization has to decide here
needs_types = [dict(directive="req", title="Requirement", prefix="RS_", color="#BFD8D2", style="node"),
               dict(directive="req_sys", title="System Requirement", prefix="SYS_", color="#BFD8D2", style="node"),
               dict(directive="req_sw", title="Software Requirement", prefix="SW_", color="#DF744A", style="node"),
               dict(directive="spec", title="Specification", prefix="S_", color="#FEDCD2", style="node"),
               dict(directive="uc", title="Use Case", prefix="UC_", color="#DF744A", style="node"),
               dict(directive="arch", title="Architecture", prefix="SWARCH", color="#FF0011", style="node"),
               dict(directive="test", title="Test", prefix="TEST_", color="#DCB239", style="node"),
               # Kept for backwards compatibility
               dict(directive="need", title="Need", prefix="N_", color="#9856a5", style="node")
           ]

needs_permalink_file = "apex.ai.permalink.html"
needs_extra_options = [ 'introduced', 
                        'updated', 
                        'impacts',
                        'security-relevance',
                        'safety-relevance',
                        'asil',
                        'cal',
                        'rationale',
                        'dependencies',
                        'use_case'
                        ]

needs_extra_links = [
   {
        "option": "tests",
        "incoming": "is tested by",
        "outgoing": "tests",
   },
   {
        "option": "implements",
        "incoming": "is implemented by",
        "outgoing": "implements"
   },
   {
        "option": "verifies",
        "incoming": "is verified by",
        "outgoing": "verifies"
   },
   {
        "option": "satisfies",
        "incoming": "satisfied by",
        "outgoing": "satisfies",    
   },
   {
        "option": "depends",
        "incoming": "depends on",
        "outgoing": "depends on",
   }
]
