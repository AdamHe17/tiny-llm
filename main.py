from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import requests
from pydantic import BaseModel
from typing import Optional


app = FastAPI()
origins = ["http://localhost:3000", "localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_CLIENT = OpenAI()


class Prompt(BaseModel):
    repoUrl: str
    prompt: str
    oldResponse: Optional[list[str]] = None


@app.post("/prompt")
def get_diff(request: Prompt):
    print(request)
    file_text = _parse_file_from_raw(request.repoUrl)

    gpt_prompt = ""
    if not request.oldResponse:
        gpt_prompt = f"Generate a new code diff, the prompt is {request.prompt}. Apply the given prompt to:\n{file_text}"
    else:
        old_responses = "\n\n".join(request.oldResponse)
        gpt_prompt = (
            f"Generate a new code diff, the prompt is still {request.prompt}."
            f"Apply the given prompt to: \n{file_text}.\nThe new response must be different from all previous responses: {old_responses}"
        )

    print(gpt_prompt)

    completion = OPENAI_CLIENT.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a code diff generator, outputs must only be in unified code diff format, no other formats are allowed."
                ),
            },
            {"role": "user", "content": gpt_prompt},
        ],
        temperature=1,
    )

    return completion.choices[0].message


def _parse_file_from_raw(url: str):
    "https://github.com/AdamHe17/tiny-llm/blob/main/test.py"
    raw_url = url.replace("github.com", "raw.githubusercontent.com").replace(
        "/blob/", "/"
    )
    r = requests.get(raw_url)
    return r.text
