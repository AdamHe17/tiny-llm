import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";

function App() {
	const [url, setUrl] = useState(
		"https://github.com/AdamHe17/tiny-llm/blob/main/test.py"
	);
	const [prompt, setPrompt] = useState("Add a method to add two integers");

	const [responses, setResponses] = useState([]);

	const generateOutput = async (e) => {
		e.preventDefault();
		console.log(`submitted prompt, url=${url} and prompt=${prompt}`);
		const resp = await fetch("https://tiny-llm.onrender.com/prompt", {
			method: "Post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				repoUrl: url,
				prompt: prompt,
			}),
		});
		const content = await resp.json();
		setResponses([content.content]);
	};

	const regenerate = async (e) => {
		e.preventDefault();
		console.log(`regenerating output, url=${url} and prompt=${prompt}`);
		const resp = await fetch("https://tiny-llm.onrender.com/prompt", {
			method: "Post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				repoUrl: url,
				prompt: prompt,
				oldResponse: responses,
			}),
		});
		const content = await resp.json();
		setResponses([...responses, content.content]);
	};

	return (
		<div>
			<div className="container">
				<h2>tiny-llm</h2>
				<form>
					<div className="form-group">
						<label htmlFor="url">url:</label>
						<input
							type="text"
							id="url"
							name="url"
							value={url}
							onChange={(e) => {
								setUrl(e.target.value);
							}}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="prompt">Prompt:</label>
						<input
							type="text"
							id="prompt"
							name="prompt"
							value={prompt}
							onChange={(e) => {
								setPrompt(e.target.value);
								setResponses([]);
							}}
						/>
					</div>
					<input
						type="submit"
						value="Submit"
						onClick={generateOutput}
					/>
					<input
						type="button"
						value="Regenerate"
						onClick={regenerate}
					/>
				</form>
			</div>

			<ul className="code-list">
				{responses.map((response, index) => (
					<li>
						<h2>Version {index}</h2>
						<code>{response}</code>
					</li>
				))}
			</ul>
		</div>
	);
}

export default App;
