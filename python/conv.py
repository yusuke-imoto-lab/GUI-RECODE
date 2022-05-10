import sys
import screcode
import numpy as np
import scipy
import scanpy
import pandas as pd


if len(sys.argv) != 8:
    sys.exit(1)
else:
    input_filename = sys.argv[1]
    output_filename = sys.argv[2]
    seq = sys.argv[3]
    ftype = sys.argv[4]
    mat_form = sys.argv[5]
    id_header = sys.argv[6]
    id_index = sys.argv[7]

print("---- begin", file=sys.stderr)

if ftype == "h5":
    adata = scanpy.readwrite._read_v3_10x_h5(input_filename)
    print("---- loaded input file", file=sys.stderr);
    recode = screcode.RECODE(seq_target=seq)
    adata = recode.fit_transform(adata)
    print("----  recode done", file=sys.stderr)
    adata.write(output_filename)
    print("---- wrote output file", file=sys.stderr);
else:
    if ftype == "tsv":
        delimiter="\t"
    elif ftype == "csv":
        delimiter=","
    elif ftype == "ssv":
        delimiter=" "
    id_h = 0 if id_header == "true" else None
    id_i = 0 if id_index == "true" else None
    data_pd = pd.read_csv(input_filename,delimiter=delimiter,header=id_h,index_col=id_i)
    if mat_form == 'trans': data_pd = data_pd.T
    print("---- loaded input file", file=sys.stderr)
    recode = screcode.RECODE(seq_target=seq)
    data_scRECODE = recode.fit_transform(np.array(data_pd.values))
    data_pd.values[:,:] = data_scRECODE
    print("----  recode done", file=sys.stderr)
    data_pd.to_csv(output_filename,sep=delimiter)
    print("---- wrote output file", file=sys.stderr);


recode.report(save = True,save_filename = 'report', save_format='png', show=False)
print("---- wrote report.png", file=sys.stderr);


# recode.check_applicability(save = True,save_filename = 'check_applicability', save_format='png', show=False)
# print("---- wrote check_applicability.png", file=sys.stderr);

# #recode.plot_procedures(save = True, save_filename = 'plot_procedures',  save_format = 'png',show=False)
# recode.plot_mean_variance(save = True, save_filename = 'plot_mean_variance', save_format='png', show=False)
# print("---- wrote plot_mean_variance.png", file=sys.stderr);
# recode.plot_mean_cv(save = True, save_filename = 'plot_mean_cv', save_format='png', show=False)
# print("---- wrote plot_mean_cv.png", file=sys.stderr);

# import json
# import numpy as np

# class NumpyEncoder(json.JSONEncoder):
#     """ Special json encoder for numpy types """
#     def default(self, obj):
#         if isinstance(obj, np.integer):
#             return int(obj)
#         elif isinstance(obj, np.floating):
#             return float(obj)
#         elif isinstance(obj, np.ndarray):
#             return obj.tolist()
#         return json.JSONEncoder.default(self, obj)

# dumped = json.dumps(recode.log_, cls=NumpyEncoder)

# f = open('./log', 'w')
# f.write(dumped)
# f.close()

# n_show_genes = 10
# detection_rate_ = np.sum(np.where(adata.X.toarray()>0,1,0),axis=0)/adata.shape[0]
# idx_dr = detection_rate_>0.01
# idx_rank = np.argsort(recode.cv_[idx_dr])[::-1]
# generank = pd.DataFrame({'gene':adata.var.index[idx_dr][idx_rank],
#                'cv':recode.cv_[idx_dr][idx_rank],
#                'normalized_variance':recode.normalized_variance_[idx_dr][idx_rank],
#                'detection_rate':detection_rate_[idx_dr][idx_rank],
#                'significance':recode.significance_[idx_dr][idx_rank]},
#               index=np.arange(len(adata.var.index[idx_dr]))+1)
# generank.head(n_show_genes)

# f = open('./generank', 'w')
# f.write(generank.to_csv())
# f.close()

# print("---- done", file=sys.stderr);

#f = open('./generank.html', 'w')
#f.write(generank.to_html())
#f.close()




