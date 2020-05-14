#include <u.h>
#include <libc.h>

#define BUFSIZ 1024

char buf[BUFSIZ];
vlong bufpos;

char *file = nil;
vlong frompos = 0;
vlong topos = 0;

void
usage(void)
{
	fprint(2, "usage: %s -f file -s start -e end\n", argv0);
	exits("usage");
}

void
main(int argc, char **argv)
{
	Dir *d;
	vlong readlength;
	long n, r;
	int fd;
	
	ARGBEGIN {
	case 'f':
		file = EARGF(usage());
		break;
	case 's':
		frompos = atoi(EARGF(usage()));
		break;
	case 'e':
		topos = atoi(EARGF(usage()));
		break;
	} ARGEND;
	
	if (file == nil) {
		usage();
	}
	
	d = dirstat(file);
	
	if (topos <= 0)
		topos = d->length;
	
	if (topos > d->length)
		topos = d->length;
	
	if (frompos > d->length)
		sysfatal("nothing to read");
	
	readlength = topos - frompos;
	
	if ((fd = open(file, OREAD)) <= 0) {
		sysfatal("cannot open file %s: %r", file);
	}
	
	if (seek(fd, frompos, 0) != frompos) {
		sysfatal("cannot seek position: %r");
	}
	
	while (readlength > 0) {
		r = readlength > BUFSIZ ? BUFSIZ : readlength;
		if ((n = read(fd, buf, r)) != r) {
			sysfatal("error reading from file: %r");
		}
		if (write(1, buf, n) != n) {
			sysfatal("error writing to stdout: %r");
		}
		readlength -= n;
	}
}
