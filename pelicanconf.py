#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'AtomScott'
SITENAME = 'Dashboard'
SITEURL = 'https://shukyu.github.io/Dashboard'

PATH = 'content'

TIMEZONE = 'Japan'

DEFAULT_LANG = 'en'
#Copy the encrypt_content folder to the root of your Pelican project (or somewhere that is accessible for importing),and, add the following to your pelicanconf.py file:

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None
DELETE_OUTPUT_DIRECTORY = False
OUTPUT_PATH = 'docs/'
# Blogroll
LINKS = (('Pelican', 'http://getpelican.com/'),
         ('Python.org', 'http://python.org/'),
         ('Jinja2', 'http://jinja.pocoo.org/'),
         ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = 10
#encrypted
PLUGINS = []
ENCRYPT_CONTENT = {
    'title_prefix': '[Encrypted]',
    'summary': 'This content is encrypted.'
}
# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True

THEME = "myTheme"

import sys
sys.path.insert(0, './')
from generate import main
main()
