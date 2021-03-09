async function auth() {

    let requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            email: "Admin@Admin",
            password: "@@@dmin",
            clientid: "1",
            locationid: "1"
        },
        redirect: 'follow'
    };

    fetch("http://localhost:3010/fa6_api/authenticate", requestOptions)
        .then(response => console.log(response))
        .catch(error => console.log('error', error));
}