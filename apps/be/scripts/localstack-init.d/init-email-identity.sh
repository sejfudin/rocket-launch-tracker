#!/bin/sh

set -e

awslocal ses verify-email-identity --email info@example.com
