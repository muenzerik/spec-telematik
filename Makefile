# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line, and also
# from the environment for the first two.
CWD:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
CONFIGDIR     = config
SOURCEDIR     = ..
BUILDDIR      = build
LOGDIR        = log
UTILSDIR      = utils

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile req all

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

all: req

${CWD}/${UTILSDIR}/plantuml.jar:
	@echo "Downloading Prerequisite: PlantUML"
	@mkdir ${UTILSDIR}
	@wget http://sourceforge.net/projects/plantuml/files/plantuml.jar/download -O "${UTILSDIR}"/plantuml.jar
	@touch $@

req: ${CWD}/${UTILSDIR}/plantuml.jar
	@echo "Creating documentation"
	@sphinx-build -E -c "$(CONFIGDIR)" -b html "$(SOURCEDIR)" "$(BUILDDIR)"

clean:
	@echo "Cleaning"
	@rm -rf "${BUILDDIR}"
	@rm -rf "${LOGDIR}"
