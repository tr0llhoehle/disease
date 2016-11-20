# Disease server backend

## Setup

```
npm install
```

To make sure everything is working:

```
npm test
```

## API

All APIs are HTTP GET or POST requests following the schema:

`http://{host}/{service}/v{version}/{uid}`

For POST requests the payload is a JSON object with the key `{service}` containing the actual payload.

### Update V1

Update the current location of the player.

#### Example

`http://localhost:5000/update/v1/1000`

```json
{
  "update": {
    "records": [
      [ 8.417050838470459, 49.012245718525065, 1479604144761],
      [ 8.416342735290527, 49.012245718525065, 1479604144762 ],
      [ 8.416192531585693, 49.012161274225235, 1479604144763 ],
      [ 8.415999412536621, 49.01169682801593, 1479604144764 ],
      [ 8.415913581848145, 49.01128867474003, 1479604144765 ],
      [ 8.415591716766357, 49.011133857104866, 1479604144766 ],
      [ 8.414754867553711, 49.01092274137201, 1479604144767 ]
    ]
  }
}
```

#### Request

POST request to the URL`http://{host}/update/v1/{uid}` with a JSON object containg the payload:

- update: `object` with the keys:
  - records: `array` of arrays of the form `[lon, lat, timestamp]`

#### Response
