"""A minimal fake of the `genlayer` SDK, used ONLY by this test suite.

The real contract runs inside GenVM, which isn't available here. This stub
lets tests `import contracts.opennotum` and exercise its actual code —
deterministic validation, storage wiring, and the resolve() control flow —
outside the VM. `gl.nondet.web.get`, `gl.nondet.exec_prompt`, and
`gl.eq_principle.prompt_comparative` are replaced with test-controlled
functions rather than a real consensus round: this is "direct-mode" unit
testing per docs/TRD.md, not a substitute for the Studionet integration
checks already done against the live deployed contract (see README).

Must be imported (which registers itself in sys.modules) before the
contract module is imported.
"""

import sys
import types


class UserError(Exception):
    pass


class Address:
    def __init__(self, value: str):
        self._value = value

    @property
    def as_hex(self) -> str:
        return self._value

    def __eq__(self, other):
        return isinstance(other, Address) and self._value.lower() == other._value.lower()

    def __hash__(self):
        return hash(self._value.lower())

    def __str__(self):
        return self._value

    def __repr__(self):
        return f"Address({self._value!r})"


class TreeMap(dict):
    """Storage-backed map stand-in — a plain dict is a faithful enough model for tests."""

    def __class_getitem__(cls, _item):
        return cls


class DynArray(list):
    """Storage-backed array stand-in — a plain list is a faithful enough model for tests."""

    def __class_getitem__(cls, _item):
        return cls


u256 = int
i32 = int
i256 = int
bigint = int


def allow_storage(cls):
    return cls


class Contract:
    """Auto-initializes TreeMap/DynArray-annotated fields, mirroring GenVM's
    default-initialized storage — the real contract's __init__ never sets
    `cases`/`case_order` itself, relying on that default."""

    def __new__(cls, *args, **kwargs):
        obj = object.__new__(cls)
        for name, typ in getattr(cls, "__annotations__", {}).items():
            if typ is TreeMap:
                object.__setattr__(obj, name, TreeMap())
            elif typ is DynArray:
                object.__setattr__(obj, name, DynArray())
        return obj


class _Public:
    @staticmethod
    def write(fn):
        return fn

    @staticmethod
    def view(fn):
        return fn


class _Message:
    """Test cases set `gl.message.sender_address = Address("0x...")` before each call."""

    def __init__(self):
        self.sender_address = Address("0x0000000000000000000000000000000000000000")


class _Vm:
    UserError = UserError


class _Web:
    def get(self, url: str):
        raise NotImplementedError("test must monkeypatch gl.nondet.web.get")


class _Nondet:
    def __init__(self):
        self.web = _Web()

    def exec_prompt(self, prompt: str, response_format: str = "json"):
        raise NotImplementedError("test must monkeypatch gl.nondet.exec_prompt")


class _EqPrinciple:
    @staticmethod
    def prompt_comparative(fn, principle: str = ""):
        """Direct-mode stand-in for consensus: just runs the nondet function once."""
        return fn()


class _GL:
    Contract = Contract
    public = _Public()
    message = _Message()
    vm = _Vm()
    nondet = _Nondet()
    eq_principle = _EqPrinciple()


gl = _GL()

# Build a real module object (not just a namespace) so `from genlayer import *`
# and `import genlayer` both work the way the contract file expects.
_module = types.ModuleType("genlayer")
_module.gl = gl
_module.Address = Address
_module.TreeMap = TreeMap
_module.DynArray = DynArray
_module.u256 = u256
_module.i32 = i32
_module.i256 = i256
_module.bigint = bigint
_module.allow_storage = allow_storage
sys.modules["genlayer"] = _module
