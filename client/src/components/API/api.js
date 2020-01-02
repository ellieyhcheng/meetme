import axios from 'axios';

const client = axios.create({
    baseURL: '/',
    withCredentials: true
});

class API {
    getEvent(eventId) {
        return this.perform('get', `/events/${eventId}`)
    }

    createEvent(eventName, availability) {
        return this.perform('post', `/events`, {eventName, availability});
    }

    processLogin(eventId, user) {
        return this.perform('post', `/events/${eventId}/login`, user)
    }

    updateAvailability(availability, uid, eventId) {
        return this.perform('post', `/events/${eventId}`, {availability, uid})
    }

    async perform (method, resource, data) {
        return client({
            method,
            url: resource,
            data,
        }).then(res => {
            return res.data ? res.data : null;
        }).catch(e => {
            console.log(`${method} ${resource} caused:\n ${e}`);
            return null
        })
    }
}

export default API;