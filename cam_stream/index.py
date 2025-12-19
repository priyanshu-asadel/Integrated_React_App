import cv2
from flask import Flask, render_template, jsonify, Response,request
from flask_cors import CORS


import json
import ast
from threading import Thread
from multiprocessing import Process

import redis
import time
from camera import VideoCamera

import os



app = Flask(__name__)
CORS(app)
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))





@app.route("/")
def index():
        return render_template("index")

def gen(camera):
    while True:
        frame = camera.get_frame()
        #frame=cv2.resize(frame,(680,480))
        if frame is None:
            break		
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed', methods=['GET'])
def video_feed():
    #x= "rtsp://ranu:Bharat1947@192.168.0.21:554/profile2/media.smp"   request.args.get('w') "rtmp://103.82.221.186:1935/live/feed"
    return Response(gen(VideoCamera(request.args.get('w'))),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':


    
 
    context = ('encryption/domain.crt', 'encryption/domain.key')
    app.run( host='192.168.176.133',port=1339,threaded=True,ssl_context=context)#,ssl_context='adhoc'
