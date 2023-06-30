# Telematics Infrastructure Specification

This repository is part of a PoC demonstrator in order to conduct a feasibility study whether to utilize a git/flow based specification development methodology for the telematics infrastructure specification of the German federal health system.

The PoC utilises [sphinx](https://www.sphinx-doc.org/en/master/index.html) for describing the required specifications and the [sphinx-needs](https://sphinx-needs.readthedocs.io/en/latest/index.html) extension module to be able to manage requirements which is essential for specifying a robust system, targeted to process delicate personal data of about 80 million German citizens.

## Prerequisites

The following tools shall be provisioned before attempting to make a specification build:
- make
- python3
- pip
- graphviz

In addition, the python modules as described in [requirements.txt](requirements.txt) shall be provided via pip install:
```
pip install -r requirements.txt
```

## Building the Specification

In the simplest case, just execute the 'req' make target:
```
make req
```

As a result, the regarding html specification files shall be available in the [build](build/) folder.

## License and copyright notice:

All files in this repository are licensed under Apache license as you can see in the [LICENSE](LICENSE) file unless particularly marked and noted otherwise.

## Disclaimer

The document versions used in this PoC in GitHub do not correspond to the latest official, valid and admissible specification document versions of the national agency for digitalization of the German federal health system [gematik](https://www.gematik.de/). The current stage of the PoC in this Repository is still in a test phase.