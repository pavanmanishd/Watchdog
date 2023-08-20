import os
import multiprocessing

def start_server():
    print("Starting server")
    os.system("python server.py")
    print('Started server')

def start_data_loader():
    print("Starting data_loader")
    os.system("python data_loader.py")
    print('Started data_loader')

def start_notifier():
    print("Starting notifier")
    os.system("python notifier.py")
    print('Started notifier')

def start_model():
    print("Starting model")
    os.system("python camera_model.py")
    print('Started model')

if __name__ == "__main__":
    server_process = multiprocessing.Process(target=start_server)
    server_process.start()
    data_loader_process = multiprocessing.Process(target=start_data_loader)
    data_loader_process.start()
    notifier_process = multiprocessing.Process(target=start_notifier)
    notifier_process.start()
    model_process = multiprocessing.Process(target=start_model)
    model_process.start()

    print('END')

    while True:
        continue