const API_URL = 'http://localhost:8000/v1'

async function httpGetPlanets() {
  const planets = await fetch(`${API_URL}/planets`)
  return await planets.json()
}

async function httpGetLaunches() {
  const res = await fetch(`${API_URL}/launches`)
  const fechedLaunches = await res.json()
  return fechedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber
  })
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${API_URL}/launches`, {
      method: 'post',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(launch)
    })
  } catch (err) {
    return {
      ok: false
    }
  }
}

async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: "delete"
    })
  } catch(err){
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};