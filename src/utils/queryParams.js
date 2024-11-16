function getQueryOptions(query) {
    const page = query.page * 1 || 1;
    const limit = query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    let sort = {'createdAt': -1}
    return {limit, skip, sort, page}
}
export default getQueryOptions