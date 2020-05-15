gridchat web
============

This application is an extension of
[rc-httpd(8)](http://man.9front.org/8/rc-httpd). It supports
the `Range` HTTP header field.

For correctly retrieving the data from files, this repository also
contains a native plan9 application (C source code in `/src`, there's
also a mkfile).

In addition, the use case is providing a progressive web app for
reading and writing the [gridchat](http://9gridchan.org/).

Installation
------------

You need a plan9/9front system. The repository is complete, so
after `cd src; mk` you should be ready to go. The `run` script
prepares the namespace.

You need to mount the gridchat to `/n/chat` before starting
the `run` script.
