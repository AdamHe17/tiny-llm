def hello(name: str) -> None:
    """Say hello to {name}"""
    print(f"Hello {name}!")


def hello_world(name="world"):
    hello(name)
