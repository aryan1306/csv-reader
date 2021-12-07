import * as fs from "fs";

export const readdir = (dirname: string) => {
	return new Promise((resolve, reject) => {
		fs.readdir(dirname, (error, filenames) => {
			if (error) {
				reject(error);
			} else {
				resolve(filenames);
			}
		});
	});
};

export const filtercsvFiles = (filename: string) => {
	return filename.split(".")[0] === "books" || "magzines";
};
