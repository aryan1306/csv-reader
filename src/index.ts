import express from "express";
import path from "path";
import dotenv from "dotenv";
import csv from "csv-parser";
import * as fs from "fs";

const main = () => {
	// let authors: any[] = [];
	interface Results {
		title: string;
		isbn: string;
		authors: string;
		description?: string;
		publishedAt?: string;
	}
	let authors: any[] = [];
	let results: Results[] = [];
	// let books = [];
	// let magazines = [];
	dotenv.config({ path: path.resolve(__dirname, "../.env") });
	const app = express();
	app.use(express.json());

	app.get("/", (_req, res) => {
		res.send("hello");
	});
	app.get("/get/authors", (_req, res) => {
		if (authors.length > 0) {
			res.status(200).json(authors);
			return;
		}
		fs.createReadStream("./csv/author.csv")
			.pipe(csv())
			.on("data", (data) => {
				// let authors: object[] = [];
				// console.log(row);
				authors.push(data);
				// console.log(authors);
			})
			.on("end", () => {
				// console.log(authors);
				// res.send({ authors: authors });
				res.status(200).json({ authors });
				return;
			});
	});

	app.get("/get/books-magazines", (_req, res) => {
		if (results.length > 0) {
			res.status(200).json({ result: results });
			return;
		}
		fs.createReadStream("./csv/books.csv")
			.pipe(csv())
			.on("data", (data) => results.push(data));
		fs.createReadStream("./csv/magzines.csv")
			.pipe(csv())
			.on("data", (data) => {
				results.push(data);
			})
			.on("end", () => {
				res.status(200).json({ result: results });
				return;
			});
	});

	app.get("/get/books-magazines/isbn/:isbn", (req, res) => {
		const isbn = req.params.isbn;
		if (results.length < 0) {
			res.status(500).json({ error: "Server Error" });
		}
		const result = results.filter((r) => r.isbn === isbn);
		res.send(result);
	});

	app.get("/get/books-magazines/author/:email", (req, res) => {
		const email = req.params.email;
		if (results.length < 0) {
			res.status(500).json({ error: "Server Error" });
		}
		const result = results.filter((r) => r.authors === email);
		res.send(result);
	});

	app.get("/get/book-magazines/sort/title", (_req, res) => {
		let compareName = function (result1: Results, result2: Results) {
			if (result1.title > result2.title) {
				return -1;
			}
			if (result1.title < result2.title) {
				return 1;
			}
			return 0;
		};
		const result = results.sort(compareName);
		res.json({ result });
	});

	app.post("/post/book-magazine", (req, res) => {
		let body = req.body;
		results.push(body);
		const headers =
			Object.keys(results[0])
				.map((_) => JSON.stringify(_))
				.join(";") + "\n";
		const outData = results.reduce((acc, row) => {
			return (
				acc +
				Object.values(row)
					.map((_) => JSON.stringify(_))
					.join(";") +
				"\n"
			);
		}, headers);
		let writerStream = fs
			.createWriteStream("./csv/out.csv", { flags: "a" })
			.on("finish", () => console.log("write finish"))
			.on("error", (err) => console.error(err));
		writerStream.write(outData, () => {
			console.log("Data written to file");
			res.json({ response: "Data written to /csv/out.csv" });
		});
		writerStream.close();
	});

	app.listen(parseInt(process.env.PORT!), () => {
		console.log(`Server running at ${process.env.PORT!}`);
	});
};
main();
