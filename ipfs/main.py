import requests
import time

# Define the URL of the server where you want to send the POST request
ipfs = 'http://localhost:5000/data'
server = 'http://localhost:3001/'


# Function to send the POST request
def send_post_request(data):
    try:
        response = requests.post(server, json=data)  # Send the POST request with JSON data
        if response.status_code == 200:
            print(f'Successfully sent POST request to {server}')
        else:
            print(f'Failed to send POST request. Status code: {response.status_code}')
    except Exception as e:
        print(f'An error occurred: {str(e)}')

def get_file_from_hash(hash):
    try:
        response = requests.get(ipfs + hash)
        if response.status_code == 200:
            print(f'Successfully got file from IPFS')
            send_post_request(response.json())
        else:
            print(f'Failed to get file from IPFS. Status code: {response.status_code}')
    except Exception as e:
        print(f'An error occurred: {str(e)}')
    


# Main loop to send the POST request every 10 minutes
while True:
    get_file_from_hash('kjfsdvkjsbdkj')
    time.sleep(600)  # Sleep for 600 seconds (10 minutes) before sending the next request
