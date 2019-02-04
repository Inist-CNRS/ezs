const notFound = () => (request, response) => {
    response.writeHead(404);
    response.end();
};

export default notFound;
