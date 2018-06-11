# -*- coding: utf8 -*-
import uuid
import json
import os
import logging
import re


def main_handler(event, context):
    print('Loading function')
    print "event==={}===".format(event)
    print "context==={}===".format(context)
    if "requestContext" not in event.keys():
        logger.info("event is not come from api gateway")
        return json.dumps({"errorCode": 410, "errorMsg": "event is not come from api gateway"})
    print('Start parse json')
    jdat = json.loads(event['body'])  # load json string to python dict
    print(jdat)
    print('End parse json')
    return json.dumps(jdat)
