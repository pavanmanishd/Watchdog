import os
import multiprocessing
import logging

logging.basicConfig(
    filename = 'model.log',
    # encoding = 'utf-8',
    format='%(asctime)s,%(msecs)03d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
    datefmt='%Y-%m-%d:%H:%M:%S',
    level=logging.DEBUG)

def start_server():
    print("[INFO] Starting server...")
    logging.info('Starting server...')
    os.system("python server.py")
    print('[INFO] Started server')
    logging.info('Started server')

def start_data_loader():
    print("[INFO] Starting data_loader...")
    logging.info('Starting data_loader...')
    os.system("python data_loader.py")
    print('[INFO] Started data_loader')
    logging.info('Started data_loader')

def start_model():
    print("[INFO] Starting model...")
    logging.info('Starting model...')
    os.system("python camera_model.py")
    print('[INFO] Started model')
    logging.info('Started model')

def start_notifier():
    print("[INFO] Starting notifier...")
    logging.info('Starting notifier...')
    os.system("python notifier.py")
    print('[INFO] Started notifier')
    logging.info('Started notifier')


if __name__ == "__main__":
    server_process = multiprocessing.Process(target=start_server)
    server_process.start()
    data_loader_process = multiprocessing.Process(target=start_data_loader)
    data_loader_process.start()
    notifier_process = multiprocessing.Process(target=start_notifier)
    notifier_process.start()
    model_process = multiprocessing.Process(target=start_model)
    model_process.start()

    # print('END')

    while True:
        continue