/* eslint-disable import/prefer-default-export */
export const getFileIcon = filename => {
  const extension = filename.slice(
    (Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1
  );

  switch (extension.toLowerCase()) {
    // Audio Files
    case 'aif':
    case 'mid':
    case 'midi':
    case 'mp3':
    case 'mpa':
    case 'ogg':
    case 'wav':
    case 'wma':
    case 'wpl':
      return { icon: 'far fa-file-audio', color: '#03A9F4' };
    // Compressed files
    case '7z':
    case 'arj':
    case 'deb':
    case 'pkg':
    case 'rar':
    case 'rpm':
    case 'z':
    case 'zip':
    case 'gz':
      return { icon: 'far fa-file-archive', color: '#FFC107' };
    // Image files
    case 'ai':
    case 'bmp':
    case 'gif':
    case 'ico':
    case 'jpeg':
    case 'jpg':
    case 'png':
    case 'ps':
    case 'psd':
    case 'svg':
    case 'tif':
    case 'tiff':
    case 'icns':
      return { icon: 'far fa-file-image', color: '#536DFE' };
    // Code files
    case 'asp':
    case 'aspx':
    case 'cer':
    case 'cfm':
    case 'cgi':
    case 'pl':
    case 'css':
    case 'scss':
    case 'less':
    case 'htm':
    case 'html':
    case 'js':
    case 'jsp':
    case 'jsx':
    case 'php':
    case 'py':
    case 'rss':
    case 'xhtml':
    case 'xml':
    case 'c':
    case 'class':
    case 'cpp':
    case 'cs':
    case 'h':
    case 'java':
    case 'sh':
    case 'swift':
    case 'vb':
    case 'json':
    case 'babelrc':
    case 'yml':
      return { icon: 'far fa-file-code', color: '#673AB7' };
    // Video files
    case '3g2':
    case '3gp':
    case 'avi':
    case 'flv':
    case 'h264':
    case 'm4v':
    case 'mkv':
    case 'mov':
    case 'mp4':
    case 'mpg':
    case 'mpeg':
    case 'rm':
    case 'swf':
    case 'vob':
    case 'wmv':
      return { icon: 'far fa-file-video', color: '#F44336' };
    // PowerPoint files
    case 'pps':
    case 'ppt':
    case 'pptx':
      return { icon: 'far fa-file-powerpoint', color: '#d24726' };
    // Excel files
    case 'xlr':
    case 'xls':
    case 'xlsx':
      return { icon: 'far fa-file-excel', color: '#217346' };
    // Word Files
    case 'doc':
    case 'docx':
      return { icon: 'far fa-file-word', color: '#2b579a' };
    // Text files
    case 'odt':
    case 'rtf':
    case 'tex':
    case 'txt':
    case 'wks':
    case 'wps':
    case 'wpd':
    case 'pages':
      return { icon: 'far fa-file-alt', color: '#607D8B' };
    // pdf files
    case 'pdf':
      return { icon: 'far fa-file-pdf', color: '#ff0000' };
    default:
      return { icon: 'far fa-file', color: '#000' };
  }
};