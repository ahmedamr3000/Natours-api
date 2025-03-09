// api features class
class ApiFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	// filter fields method
	filter() {

		const queryObj = { ...this.queryString }
		const excludedFields = ['sort', 'page', 'limit', 'fields'] // exclude these strings from query string
		excludedFields.forEach(el => delete queryObj[el])

		// advanced filtering -  replace operator with $operator - ex: gte => $gte
		let queryStr = JSON.stringify(queryObj)
		queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`))
		this.query = this.query.find(queryStr)

		return this;
	}

	// sorting method
	sort() {

		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(",").join(" ")
			this.query = this.query.sort(sortBy)
		} else {
			this.query = this.query.sort("-createdAt")
		}

		return this;
	}

	// pagination method
	paginate() {

		const page = +this.queryString.page || 1;
		const limit = +this.queryString.limit || 100;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit)

		return this;
	}

	//limit return fields
	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(",").join(" ")
			this.query = this.query.select(fields)
		} else {
			this.query = this.query.select("-__v")
		}

		return this;
	}
}

module.exports = ApiFeatures