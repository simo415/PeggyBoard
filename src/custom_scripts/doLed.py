#!/usr/bin/env python3

#==========================================
# Title:  doLed.py
# Author: Pegor Karoglanian
# Date:   8/10/23
# Notes:  This script gets called to display the selected climb
#         on the LEDs.
#==========================================

import os
import sys
import board
import neopixel
import time
import json
import base64

def clearBoard():
    for x in range(LEDs):
        ledWall[x] = (0, 0, 0)
    ledWall.show()

def lightHolds():
    for hold in currentProblem:
        hexColor = int(hold['color'][::-1], 16)
        #lv = len(hold['color'])
        #hexColor = tuple(int(hold['color'][i:i + lv//3],16) for i in range(0, lv, lv//3))
        ledWall[hold['hold'] - 1] = hexColor
    log(ledWall)
    ledWall.show()

def log(msg):
   with open("doLed.log", "a") as logfile:
       logfile.write("%s\n" % msg) 

try:
    ledCmd = sys.argv[1]
    currentProblem = sys.argv[2]
    if currentProblem != "0":
        currentProblem = json.loads(base64.b64decode(currentProblem))
except:
    print("Command error!")
    quit()

log(currentProblem)

LEDs = 228
ledWall = neopixel.NeoPixel(board.D18, LEDs, auto_write=False, pixel_order=neopixel.RGB)

if ledCmd == "CLEAR":
    clearBoard()
elif ledCmd == "PROBLEM":
    clearBoard()
    lightHolds()
else:
    print("What. You can't be here.")
    #hmm how'd ya get here?!
