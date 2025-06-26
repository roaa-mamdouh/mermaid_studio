__version__ = '0.0.1'

# Import the override module to apply our patches
try:
    from . import override
except ImportError:
    pass
