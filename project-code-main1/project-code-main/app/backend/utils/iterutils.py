from typing import Iterable, TypeVar

T = TypeVar("T")

def one(values: Iterable[T]) -> T:
    only_value, = values
    return only_value