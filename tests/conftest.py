import importlib.util
import pathlib

import pytest

import genlayer_stub  # registers the fake `genlayer` module in sys.modules

_CONTRACT_PATH = pathlib.Path(__file__).resolve().parent.parent / "contracts" / "opennotum.py"

OWNER = genlayer_stub.Address("0x1111111111111111111111111111111111111111")
FILER = genlayer_stub.Address("0x2222222222222222222222222222222222222222")


def _load_contract_module():
    spec = importlib.util.spec_from_file_location("opennotum_contract", _CONTRACT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def contract_module():
    return _load_contract_module()


@pytest.fixture
def gl(contract_module):
    return contract_module.gl


@pytest.fixture
def UserError(contract_module):
    return contract_module.gl.vm.UserError


@pytest.fixture
def contract(contract_module, gl):
    """A freshly deployed OpenNotum instance; deployer becomes gl.message.sender_address."""
    gl.message.sender_address = OWNER
    instance = contract_module.OpenNotum()
    gl.message.sender_address = FILER
    return instance
